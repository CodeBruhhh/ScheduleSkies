// Health check endpoint
export default function handler(req, res) {
  res.status(200).json({ message: 'Schedule Skies API is running' })
}
