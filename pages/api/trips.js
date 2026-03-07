import { supabase } from '@/lib/supabaseClient'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Fetch all trips from Supabase
      const { data, error } = await supabase
        .from('trips')
        .select('*')

      if (error) {
        return res.status(400).json({ error: error.message })
      }

      res.status(200).json({ trips: data })
    } catch (err) {
      res.status(500).json({ error: 'Internal server error' })
    }
  } else if (req.method === 'POST') {
    try {
      const { destination, departureDate, returnDate, passengers } = req.body

      // Insert new trip into Supabase
      const { data, error } = await supabase
        .from('trips')
        .insert([
          {
            destination,
            departureDate,
            returnDate,
            passengers,
            createdAt: new Date()
          }
        ])

      if (error) {
        return res.status(400).json({ error: error.message })
      }

      res.status(201).json({ trip: data })
    } catch (err) {
      res.status(500).json({ error: 'Internal server error' })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
