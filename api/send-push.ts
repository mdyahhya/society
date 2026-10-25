import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const { title, body, url = '/', target = 'all' } = req.body || {};

  if (!title || !body) {
    return res.status(400).json({ error: 'Missing title or body in request payload.' });
  }

  const vapidPublicKey =
    process.env.VAPID_PUBLIC_KEY ||
    process.env.VITE_VAPID_PUBLIC_KEY ||
    'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';

  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || '';
  const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:admin@albadr-society.org';

  if (!vapidPrivateKey) {
    return res.status(500).json({
      error: 'VAPID_PRIVATE_KEY is not configured in Vercel environment variables.',
    });
  }

  try {
    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
  } catch (err: any) {
    return res.status(500).json({ error: `VAPID initialization failed: ${err.message}` });
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: 'Supabase credentials not configured in environment.' });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Fetch subscriptions: all or specific target
  let query = supabase.from('push_subscriptions').select('*');
  if (target && target !== 'all') {
    query = query.eq('user_identifier', target);
  }

  const { data: subscriptions, error } = await query;

  if (error) {
    return res.status(500).json({ error: `Failed to fetch subscriptions: ${error.message}` });
  }

  if (!subscriptions || subscriptions.length === 0) {
    return res.status(200).json({
      success: true,
      count: 0,
      message: target === 'all'
        ? 'No registered push devices found in database.'
        : `No device registered for target: ${target}`,
    });
  }

  const payload = JSON.stringify({
    title,
    body,
    url,
    timestamp: Date.now(),
  });

  let sentCount = 0;
  const expiredEndpoints: string[] = [];

  await Promise.all(
    subscriptions.map(async (sub: any) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          payload
        );
        sentCount++;
      } catch (err: any) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          expiredEndpoints.push(sub.endpoint);
        } else {
          console.error(`Push failed for ${sub.endpoint}:`, err.message);
        }
      }
    })
  );

  // Clean up any unsubscribed or expired devices
  if (expiredEndpoints.length > 0) {
    await supabase.from('push_subscriptions').delete().in('endpoint', expiredEndpoints);
  }

  return res.status(200).json({
    success: true,
    count: sentCount,
    expiredCleaned: expiredEndpoints.length,
    message: `Push notification dispatched to ${sentCount} device(s) successfully.`,
  });
}
