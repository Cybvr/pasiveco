
"use client"

import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getUserProducts } from '@/services/productsService'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'
import { getBankingDetails } from '@/services/bankingDetailsService'
import { Plus } from 'lucide-react'

import ExploreTab from './ExploreTab'
import CreateTab from './CreateTab'  
import ManageTab from './ManageTab'



function ProductCreator() {
  const [activeTab, setActiveTab] = useState("manage")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [hasBankingDetails, setHasBankingDetails] = useState(false)
  const [selectedCategory] = useState(null)
  const [myProducts, setMyProducts] = useState([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)
  const { user } = useAuth()
  const searchParams = useSearchParams()

  const loadMyProducts = async () => {
    if (!user) {
      setMyProducts([])
      setHasBankingDetails(false)
      setIsLoadingProducts(false)
      return
    }

    setIsLoadingProducts(true)
    try {
      const [products, bankingDetails] = await Promise.all([
        getUserProducts(user.uid),
        getBankingDetails(user.uid),
      ])
      setMyProducts(products)
      setHasBankingDetails(Boolean(bankingDetails))
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

  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setIsCreateModalOpen(true)
      setActiveTab('manage')
    }
  }, [searchParams])

  const tabs = [
    { key: "manage", label: "All" },
    { key: "explore", label: "Explore" },
  ]

  

  return (
    <div className="space-y-6">
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
            hasBankingDetails={hasBankingDetails}
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
