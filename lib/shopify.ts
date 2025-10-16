// Shopify Storefront API client for HerbSpot.fi
import { createStorefrontClient } from '@shopify/storefront-api-client'

// Initialize Shopify client
export const shopify = createStorefrontClient({
  storeDomain: process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || 'herbspot.myshopify.com',
  publicStorefrontToken: process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN || '',
  apiVersion: process.env.NEXT_PUBLIC_SHOPIFY_API_VERSION || '2024-10'
})

// GraphQL queries
export const GET_PRODUCTS_QUERY = `
  query getProducts($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      edges {
        node {
          id
          title
          handle
          description
          featuredImage {
            url
            altText
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
            maxVariantPrice {
              amount
              currencyCode
            }
          }
          variants(first: 1) {
            edges {
              node {
                id
                price {
                  amount
                  currencyCode
                }
                availableForSale
                quantityAvailable
              }
            }
          }
          tags
          productType
          createdAt
          updatedAt
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`

export const GET_PRODUCT_QUERY = `
  query getProduct($handle: String!) {
    product(handle: $handle) {
      id
      title
      handle
      description
      descriptionHtml
      images(first: 10) {
        edges {
          node {
            url
            altText
            width
            height
          }
        }
      }
      variants(first: 100) {
        edges {
          node {
            id
            title
            price {
              amount
              currencyCode
            }
            availableForSale
            quantityAvailable
            selectedOptions {
              name
              value
            }
            image {
              url
              altText
            }
          }
        }
      }
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
        maxVariantPrice {
          amount
          currencyCode
        }
      }
      tags
      productType
      vendor
      createdAt
      updatedAt
    }
  }
`

export const GET_COLLECTIONS_QUERY = `
  query getCollections($first: Int!) {
    collections(first: $first) {
      edges {
        node {
          id
          title
          handle
          description
          image {
            url
            altText
          }
          products(first: 4) {
            edges {
              node {
                id
                title
                handle
                featuredImage {
                  url
                  altText
                }
                priceRange {
                  minVariantPrice {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`

// Helper functions
export async function fetchProducts(first: number = 20, after?: string) {
  try {
    const { data } = await shopify.query({
      query: GET_PRODUCTS_QUERY,
      variables: { first, after }
    })
    
    return {
      products: data?.products?.edges?.map((edge: any) => edge.node) || [],
      pageInfo: data?.products?.pageInfo
    }
  } catch (error) {
    console.error('Error fetching products:', error)
    throw error
  }
}

export async function fetchProduct(handle: string) {
  try {
    const { data } = await shopify.query({
      query: GET_PRODUCT_QUERY,
      variables: { handle }
    })
    
    return data?.product
  } catch (error) {
    console.error('Error fetching product:', error)
    throw error
  }
}

export async function fetchCollections(first: number = 10) {
  try {
    const { data } = await shopify.query({
      query: GET_COLLECTIONS_QUERY,
      variables: { first }
    })
    
    return data?.collections?.edges?.map((edge: any) => edge.node) || []
  } catch (error) {
    console.error('Error fetching collections:', error)
    throw error
  }
}

// Mock data for development/fallback
export const mockProducts = [
  {
    id: '1',
    title: 'Premium 510 Cartridge - Lavender',
    handle: 'premium-510-cartridge-lavender',
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=400&fit=crop',
      altText: 'Lavender cartridge'
    },
    priceRange: {
      minVariantPrice: {
        amount: '29.99',
        currencyCode: 'EUR'
      }
    },
    variants: {
      edges: [{
        node: {
          id: '1',
          price: { amount: '29.99', currencyCode: 'EUR' },
          availableForSale: true
        }
      }]
    }
  },
  {
    id: '2',
    title: 'Aromatherapy Device Pro',
    handle: 'aromatherapy-device-pro',
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400&h=400&fit=crop',
      altText: 'Aromatherapy device'
    },
    priceRange: {
      minVariantPrice: {
        amount: '89.99',
        currencyCode: 'EUR'
      }
    },
    variants: {
      edges: [{
        node: {
          id: '2',
          price: { amount: '89.99', currencyCode: 'EUR' },
          availableForSale: true
        }
      }]
    }
  },
  {
    id: '3',
    title: 'Essential Oil Blend - Relaxation',
    handle: 'essential-oil-blend-relaxation',
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=400&h=400&fit=crop',
      altText: 'Essential oil blend'
    },
    priceRange: {
      minVariantPrice: {
        amount: '24.99',
        currencyCode: 'EUR'
      }
    },
    variants: {
      edges: [{
        node: {
          id: '3',
          price: { amount: '24.99', currencyCode: 'EUR' },
          availableForSale: true
        }
      }]
    }
  },
  {
    id: '4',
    title: 'Premium 510 Cartridge - Eucalyptus',
    handle: 'premium-510-cartridge-eucalyptus',
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop',
      altText: 'Eucalyptus cartridge'
    },
    priceRange: {
      minVariantPrice: {
        amount: '32.99',
        currencyCode: 'EUR'
      }
    },
    variants: {
      edges: [{
        node: {
          id: '4',
          price: { amount: '32.99', currencyCode: 'EUR' },
          availableForSale: true
        }
      }]
    }
  },
  {
    id: '5',
    title: 'Portable Diffuser Mini',
    handle: 'portable-diffuser-mini',
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400&h=400&fit=crop',
      altText: 'Portable diffuser'
    },
    priceRange: {
      minVariantPrice: {
        amount: '45.99',
        currencyCode: 'EUR'
      }
    },
    variants: {
      edges: [{
        node: {
          id: '5',
          price: { amount: '45.99', currencyCode: 'EUR' },
          availableForSale: true
        }
      }]
    }
  },
  {
    id: '6',
    title: 'Essential Oil Set - Starter Pack',
    handle: 'essential-oil-set-starter-pack',
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400&h=400&fit=crop',
      altText: 'Essential oil set'
    },
    priceRange: {
      minVariantPrice: {
        amount: '59.99',
        currencyCode: 'EUR'
      }
    },
    variants: {
      edges: [{
        node: {
          id: '6',
          price: { amount: '59.99', currencyCode: 'EUR' },
          availableForSale: true
        }
      }]
    }
  }
]