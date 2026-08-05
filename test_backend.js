fetch('http://127.0.0.1:8000/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ topic: 'Physics', duration: 10, plan: 'free' })
})
.then(res => res.json())
.then(console.log)
.catch(console.error);
