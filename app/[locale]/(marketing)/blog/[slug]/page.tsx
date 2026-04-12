"use client"
import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { blogService, BlogPost } from '@/services/blogService'
import { Skeleton } from '@/components/ui/skeleton'

export default function BlogPost() {
  const params = useParams()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState('')
  const contentRef = useRef<HTMLDivElement>(null)
  const [sections, setSections] = useState<{id: string, title: string}[]>([])

  // Fetch post data
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const allPosts = await blogService.getAllPosts()
        setPosts(allPosts)
        const post = allPosts.find(p => p.id === params.slug || p.slug === params.slug)
        setPost(post)
      } catch (error) {
        console.error('Error fetching post:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchPost()
  }, [params.slug])

  // Extract headings for sidebar navigation after post content is loaded
  useEffect(() => {
    if (contentRef.current && post) {
      const headings = Array.from(contentRef.current.querySelectorAll('h1, h2, h3, h4, h5, h6'))
      const extractedSections = headings.map((heading, index) => {
        const id = heading.id || `section-${index}`
        if (!heading.id) heading.id = id
        return {
          id,
          title: heading.textContent || `Section ${index + 1}`
        }
      })
      setSections(extractedSections)
    }
  }, [post])

  // Track active section based on scroll position
  useEffect(() => {
    if (!sections.length) return

    const handleScroll = () => {
      const headingElements = sections.map(section => 
        document.getElementById(section.id)
      ).filter(Boolean) as HTMLElement[]

      const currentSection = headingElements.find(el => {
        const rect = el.getBoundingClientRect()
        return rect.top > 0 && rect.top < window.innerHeight / 2
      })

      if (currentSection) {
        setActiveSection(currentSection.id)
      } else if (headingElements.length && window.scrollY < headingElements[0].offsetTop) {
        setActiveSection(headingElements[0].id)
      }
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // Initial check

    return () => window.removeEventListener('scroll', handleScroll)
  }, [sections])

  if (loading) {
    return (
      <div className="container max-w-6xl py-16">
        <Skeleton className="h-8 w-32 mb-4" />
        <Skeleton className="h-96 w-full mb-8" />
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-3">
            <Skeleton className="h-8 w-full mb-4" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </div>
          </div>
          <div className="col-span-9">
            <Skeleton className="h-12 w-3/4 mb-4" />
            <Skeleton className="h-6 w-32 mb-8" />
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!post) return <div className="container py-16">Post not found</div>

  return (
    <div className="container max-w-6xl ">
      {/* Back Button */}
      <Link href="/blog">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Blog
        </Button>
      </Link>

      {/* Featured Image */}
      {post.imageUrl && (
        <img 
          src={post.imageUrl}
          alt={post.title}
          className="w-full h-96 object-cover rounded-lg mb-10"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = '/images/marketing/qrt.jpg'; // Fallback image
          }}
        />
      )}

      <div className="grid grid-cols-12 gap-8">
        {/* Left Sidebar - Section Navigation */}
        <div className="col-span-12 lg:col-span-3">
          <div className="sticky top-24 pr-4 border-r border-border">
            <h1 className="text-2xl font-semibold mb-4">Contents</h1>
            <nav className="space-y-2">
              {sections.map(section => (
                <a 
                  key={section.id}
                  href={`#${section.id}`}
                  className={`block py-1 text-sm transition-colors hover:text-primary ${
                    activeSection === section.id ? 'text-primary font-medium' : 'text-muted-foreground'
                  }`}
                  onClick={(e) => {
                    e.preventDefault()
                    document.getElementById(section.id)?.scrollIntoView({
                      behavior: 'smooth'
                    })
                    setActiveSection(section.id)
                  }}
                >
                  {section.title}
                </a>
              ))}
            </nav>


          </div>
        </div>

        {/* Main Content */}
        <div className="col-span-12 lg:col-span-6">
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
          <p className="text-muted-foreground mb-8">{post.date}</p>

          <div 
            ref={contentRef}
            className="prose prose-lg max-w-none" 
            dangerouslySetInnerHTML={{ __html: post.content }} 
          />
        </div>

        {/* Right Sidebar - More Articles */}
        <div className="col-span-12 lg:col-span-3 hidden lg:block">
          <div className="sticky top-24">
            <h1 className="text-xl font-semibold mb-4">More Articles</h1>
            <div className="space-y-4">
              {posts.slice(0, 5).map((recentPost) => (
                <Link 
                  key={recentPost.id} 
                  href={`/blog/${recentPost.slug}`}
                  className="block hover:bg-accent/50 p-4 rounded-lg transition-colors"
                >
                  <h4 className="font-medium mb-1">{recentPost.title}</h4>
                  <p className="text-sm text-muted-foreground">{recentPost.date}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile More Articles */}
      <div className="mt-16 pt-8 border-t border-border lg:hidden">
        <h3 className="text-xl font-semibold mb-6">More Articles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.slice(0, 4).map((recentPost) => (
            <Link 
              key={recentPost.id} 
              href={`/blog/${recentPost.slug}`}
              className="block hover:bg-accent/50 p-4 rounded-lg transition-colors"
            >
              <h4 className="font-medium mb-2">{recentPost.title}</h4>
              <p className="text-sm text-muted-foreground">{recentPost.date}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}