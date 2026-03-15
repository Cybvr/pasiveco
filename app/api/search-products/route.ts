import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { query, store, searchType = 'general' } = await request.json()

    if (!query && searchType !== 'store') {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }

    const serpApiKey = process.env.SERPAPI_KEY || 'demo'
    let searchQuery = ''
    let engine = 'google_shopping'

    // Handle different search types
    if (searchType === 'stores') {
      // Search for popular stores/retailers
      searchQuery = 'popular online shopping retailers stores'
      engine = 'google_shopping'
    } else if (searchType === 'popular') {
      // Search for trending/popular products
      searchQuery = 'trending products 2024 popular items'
      engine = 'google_shopping'
    } else if (searchType === 'store' && store) {
      // Search for products from a specific store
      searchQuery = `site:${store.toLowerCase().replace(/\s+/g, '')}.com`
      engine = 'google_shopping'
    } else if (searchType === 'general') {
      // General product search
      searchQuery = query
      engine = 'google_shopping'
    } else if (store) {
      // Search for specific products within a store
      searchQuery = `${query} site:${store.toLowerCase().replace(/\s+/g, '')}.com`
      engine = 'google_shopping'
    } else {
      // Fallback to general search
      searchQuery = query
      engine = 'google_shopping'
    }

    const apiUrl = `https://serpapi.com/search.json?engine=${engine}&q=${encodeURIComponent(searchQuery)}&api_key=${serpApiKey}&num=20&hl=en&gl=us`

    const response = await fetch(apiUrl)

    if (!response.ok) {
      throw new Error('Failed to fetch from SerpAPI')
    }

    const data = await response.json()

    // Process shopping results specifically
    const results = data.shopping_results || []

    const processedResults = results.map((result: any, index: number) => {
      // Extract price information more reliably
      let priceValue = 0
      let currency = 'USD'

      if (result.price) {
        if (typeof result.price === 'string') {
          // Extract numeric value from price string
          const priceMatch = result.price.match(/[\d,]+\.?\d*/);
          priceValue = priceMatch ? parseFloat(priceMatch[0].replace(/,/g, '')) : 0;
          currency = result.price.includes('$') ? 'USD' : 'USD';
        } else if (typeof result.price === 'object') {
          priceValue = result.price.extracted_value || result.price.value || 0;
          currency = result.price.currency || 'USD';
        }
      }

      return {
        position: result.position || index + 1,
        title: result.title || 'Product',
        snippet: result.snippet || result.title || '',
        price: {
          value: priceValue,
          currency: currency,
          extracted_value: priceValue
        },
        thumbnail: result.thumbnail,
        source: result.source || store || 'Unknown',
        link: result.link || result.product_link || result.url || '',
        product_id: result.product_id,
        rating: result.rating,
        reviews: result.reviews
      }
    })

    return NextResponse.json({
      success: true,
      results: processedResults,
      total: processedResults.length,
      searchType,
      query: searchQuery
    })

  } catch (error) {
    console.error('Error searching products:', error)
    return NextResponse.json(
      { error: 'Failed to search products' },
      { status: 500 }
    )
  }
}