
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
    { key: "create", label: "New" },
    { key: "explore", label: "Explore" },
  ]

  

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Products</h1>
          <p className="text-muted-foreground">Manage your products and start selling with Paystack integration</p>
        </div>
      </div>
      
      <div className="flex flex-wrap items-center gap-1">
        {tabs.map((tab) => (
          <Button
            key={tab.key}
            variant={activeTab === tab.key ? "default" : "secondary"}
            size="sm"
            className="h-8 px-4 rounded-full"
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      <div className="pt-2">
        

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
