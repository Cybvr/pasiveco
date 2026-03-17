
"use client"

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getUserProducts } from '@/services/productsService'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'

import ExploreTab from './ExploreTab'
import CreateTab from './CreateTab'  
import ManageTab from './ManageTab'



function ProductCreator() {
  const [activeTab, setActiveTab] = useState("manage")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedCategory] = useState(null)
  const [myProducts, setMyProducts] = useState([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)
  const { user } = useAuth()

  const loadMyProducts = async () => {
    if (!user) {
      setMyProducts([])
      setIsLoadingProducts(false)
      return
    }

    setIsLoadingProducts(true)
    try {
      const products = await getUserProducts(user.uid)
      setMyProducts(products)
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Failed to fetch products')
    } finally {
      setIsLoadingProducts(false)
    }
  }

  useEffect(() => {
    loadMyProducts()
  }, [user])

  const tabs = [
    { key: "manage", label: "Products" },
    { key: "explore", label: "Explore" },
  ]

  

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Products</h1>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          {tabs.map((tab) => (
            <TabsTrigger key={tab.key} value={tab.key}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="pt-2">
        {activeTab === "explore" && (
          <ExploreTab user={user} onProductsAdded={loadMyProducts} />
        )}

        {activeTab === "manage" && (
          <ManageTab 
            products={myProducts}
            isLoading={isLoadingProducts}
            onProductsChanged={loadMyProducts}
            onCreateNew={() => setIsCreateModalOpen(true)}
          />
        )}
      </div>

      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Product
            </DialogTitle>
          </DialogHeader>
          <CreateTab
            user={user}
            selectedCategory={selectedCategory}
            onProductCreated={() => {
              setIsCreateModalOpen(false)
              setActiveTab('manage')
              loadMyProducts()
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ProductCreator
