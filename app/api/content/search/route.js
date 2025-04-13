import { searchItems } from '../../../../lib/db-service';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    if (!query) {
      return new Response(JSON.stringify({ error: 'Search query is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const results = await searchItems(query);
    
    return new Response(JSON.stringify(results), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in search API route:', error);
    return new Response(JSON.stringify({ error: 'Failed to search content' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
