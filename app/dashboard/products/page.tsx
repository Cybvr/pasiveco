
"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getUserProducts } from '@/services/productsService'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'
import { 
  Download, 
  BookOpen, 
  GraduationCap, 
  Calendar, 
  Headphones, 
  Package
} from 'lucide-react'

import ExploreTab from './ExploreTab'
import CreateTab from './CreateTab'  
import ManageTab from './ManageTab'



function ProductCreator() {
  const [activeTab, setActiveTab] = useState("manage")
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [myProducts, setMyProducts] = useState([])
  const { user } = useAuth()

  const loadMyProducts = async () => {
    if (!user) return
    try {
      const products = await getUserProducts(user.uid)
      setMyProducts(products)
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Failed to fetch products')
    }
  }

  useEffect(() => {
    loadMyProducts()
  }, [user])

  const tabs = [
    { key: "manage", label: "My Products" },
    { key: "create", label: "Create Product" },
    { key: "explore", label: "Explore" },
  ]

  

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-lg font-semibold text-foreground">
                Products
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Manage your products and start selling with Paystack integration
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1 mt-4">
            {tabs.map((tab) => (
              <Button
                key={tab.key}
                variant={activeTab === tab.key ? "default" : "ghost"}
                size="sm"
                className="h-7 px-2.5 text-xs"
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6">
        

        {activeTab === "explore" && (
          <ExploreTab user={user} onProductsAdded={loadMyProducts} />
        )}

        {activeTab === "create" && (
          <CreateTab 
            user={user} 
            selectedCategory={selectedCategory}
            onProductCreated={() => {
              setActiveTab('manage')
              loadMyProducts()
            }} 
          />
        )}

        {activeTab === "manage" && (
          <ManageTab 
            products={myProducts}
            onProductsChanged={loadMyProducts}
            onCreateNew={() => setActiveTab("create")}
          />
        )}
      </div>
    </div>
  )
}

export default ProductCreator
