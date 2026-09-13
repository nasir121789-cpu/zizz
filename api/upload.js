import https from 'https';

export const config = {
  api: {
    bodyParser: false, // Body পার্স করা বন্ধ রাখা হয়েছে যেন বড় ফাইল সহজে স্ট্রিম হয়
  },
};

export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const options = {
    hostname: 'catbox.moe',
    port: 443,
    path: '/user/api.php',
    method: 'POST',
    headers: {
      'Content-Type': req.headers['content-type'],
      'Content-Length': req.headers['content-length']
    }
  };

  const proxyReq = https.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (e) => {
    res.status(500).json({ error: e.message });
  });

  // Client থেকে আসা ডেটা সরাসরি Catbox-এ স্ট্রিম করা হচ্ছে
  req.pipe(proxyReq);
}
