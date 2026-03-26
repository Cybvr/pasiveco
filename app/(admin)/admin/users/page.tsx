'use client'

import { useEffect, useRef, useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Trash2, Edit, Plus, Search, Upload, Sparkles, Loader2, X, Settings2, Download } from "lucide-react"
import { getAllUsers, updateUser, deleteUser, createUser, type User } from "@/services/userService"
import { DEFAULT_USER_CATEGORIES, getUserCategories, deleteUserCategory, ensureUserCategory, type UserCategory } from "@/services/categoryService"
import { Timestamp } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"

interface UserFormData {
  email: string;
  displayName: string;
  role: 'user' | 'admin' | 'moderator';
  isActive: boolean;
  isAdmin: boolean;
  username: string;
  bio: string;
  profilePicture: string;
  category: string;
  isFeatured: boolean;
  isTrending: boolean;
  tags: string;
}

interface UserFormModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isCreate: boolean;
  formData: UserFormData;
  categories: string[];
  onFormChange: (field: string, value: any) => void;
  onSubmit: () => void;
  isGeneratingBio?: boolean;
  onGenerateBio?: () => void;
}

const UserFormModal = ({
  isOpen,
  onOpenChange,
  isCreate,
  formData,
  categories,
  onFormChange,
  onSubmit,
  isGeneratingBio = false,
  onGenerateBio
}: UserFormModalProps) => (
  <Dialog open={isOpen} onOpenChange={onOpenChange}>
    <DialogContent className="max-h-[calc(100vh-2rem)] w-[calc(100%-2rem)] overflow-y-auto sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>{isCreate ? 'Create New User' : 'Edit User'}</DialogTitle>
        <DialogDescription>
          {isCreate ? 'Add a new user to the system.' : 'Make changes to the user account.'}
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
          <Label htmlFor="email" className="sm:text-right">Email *</Label>
          <Input
            id="email"
            value={formData.email}
            onChange={(e) => onFormChange('email', e.target.value)}
            className="sm:col-span-3"
            type="email"
            required
            placeholder="user@example.com"
          />
        </div>
        <div className="grid gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
          <Label htmlFor="displayName" className="sm:text-right">Name *</Label>
          <Input
            id="displayName"
            value={formData.displayName}
            onChange={(e) => onFormChange('displayName', e.target.value)}
            className="sm:col-span-3"
            required
            placeholder="User's full name"
          />
        </div>
        <div className="grid gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
          <Label htmlFor="username" className="sm:text-right">Username</Label>
          <Input
            id="username"
            value={formData.username}
            onChange={(e) => onFormChange('username', e.target.value)}
            className="sm:col-span-3"
            placeholder="@username"
          />
        </div>
        <div className="grid gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
          <Label htmlFor="role" className="sm:text-right">Role</Label>
          <Select value={formData.role} onValueChange={(value: any) => onFormChange('role', value)}>
            <SelectTrigger className="sm:col-span-3">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="moderator">Moderator</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
          <Label htmlFor="category" className="sm:text-right">Category</Label>
          <Select
            value={formData.category || 'unselected'}
            onValueChange={(value) => onFormChange('category', value === 'unselected' ? '' : value)}
          >
            <SelectTrigger className="sm:col-span-3">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unselected">No category selected</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2 sm:grid-cols-4 sm:items-start sm:gap-4">
          <div className="flex flex-col gap-1 sm:text-right">
            <Label htmlFor="bio" className="sm:pt-2">Bio</Label>
            {onGenerateBio && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onGenerateBio}
                disabled={isGeneratingBio || (!formData.displayName && !formData.category)}
                className="h-8 px-2 text-xs text-primary hover:text-primary/80"
              >
                {isGeneratingBio ? (
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                ) : (
                  <Sparkles className="mr-1 h-3 w-3" />
                )}
                Autogen
              </Button>
            )}
          </div>
          <Textarea
            id="bio"
            value={formData.bio}
            onChange={(e) => onFormChange('bio', e.target.value)}
            className="sm:col-span-3"
            rows={3}
            placeholder={isGeneratingBio ? "Generating bio..." : "Tell us about this user..."}
          />
        </div>
        <div className="grid gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
          <Label htmlFor="profilePicture" className="sm:text-right">Avatar URL</Label>
          <Input
            id="profilePicture"
            value={formData.profilePicture}
            onChange={(e) => onFormChange('profilePicture', e.target.value)}
            className="sm:col-span-3"
            type="url"
          />
        </div>
        <div className="grid gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
          <Label className="sm:text-right">Status</Label>
          <div className="flex items-center gap-2 sm:col-span-3">
            <Switch
              checked={formData.isActive}
              onCheckedChange={(checked) => onFormChange('isActive', checked)}
            />
            <span className="text-sm">{formData.isActive ? 'Active' : 'Inactive'}</span>
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
          <Label className="sm:text-right">Admin</Label>
          <div className="flex items-center gap-2 sm:col-span-3">
            <Switch
              checked={formData.isAdmin}
              onCheckedChange={(checked) => onFormChange('isAdmin', checked)}
            />
            <span className="text-sm">{formData.isAdmin ? 'Admin' : 'Regular User'}</span>
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
          <Label className="sm:text-right">Top Creator</Label>
          <div className="flex items-center gap-2 sm:col-span-3">
            <Switch
              checked={formData.isFeatured}
              onCheckedChange={(checked) => onFormChange('isFeatured', checked)}
            />
            <span className="text-sm">{formData.isFeatured ? 'Yes' : 'No'}</span>
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
          <Label className="sm:text-right">Popular this week</Label>
          <div className="flex items-center gap-2 sm:col-span-3">
            <Switch
              checked={formData.isTrending}
              onCheckedChange={(checked) => onFormChange('isTrending', checked)}
            />
            <span className="text-sm">{formData.isTrending ? 'Yes' : 'No'}</span>
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
          <Label htmlFor="tags" className="sm:text-right">Tags</Label>
          <Input
            id="tags"
            value={formData.tags}
            onChange={(e) => onFormChange('tags', e.target.value)}
            className="sm:col-span-3"
            placeholder="Comma separated tags"
          />
        </div>
      </div>
      <DialogFooter>
        <Button type="submit" onClick={onSubmit} className="w-full sm:w-auto">
          {isCreate ? 'Create User' : 'Save Changes'}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
)
interface CategoryManagerModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  categories: UserCategory[];
  onAddCategory: (name: string) => Promise<void>;
  onDeleteCategory: (slug: string) => Promise<void>;
}

const CategoryManagerModal = ({
  isOpen,
  onOpenChange,
  categories,
  onAddCategory,
  onDeleteCategory
}: CategoryManagerModalProps) => {
  const [newCategory, setNewCategory] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAdd = async () => {
    if (!newCategory.trim()) return
    setIsSubmitting(true)
    try {
      await onAddCategory(newCategory.trim())
      setNewCategory("")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Manage User Categories</DialogTitle>
          <DialogDescription>
            Add or remove categories available for users.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-2">
            <Input
              placeholder="New category name"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
            <Button size="sm" onClick={handleAdd} disabled={isSubmitting || !newCategory.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            {categories.map((cat) => (
              <Badge key={cat.slug} variant="secondary" className="pl-3 pr-1 py-1 flex items-center gap-1">
                {cat.name}
                <Button
                  variant="ghost" 
                  size="icon" 
                  className="h-4 w-4 p-0 hover:bg-transparent hover:text-destructive"
                  onClick={() => onDeleteCategory(cat.slug)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [isImporting, setIsImporting] = useState(false)
  const [isGeneratingBio, setIsGeneratingBio] = useState(false)
  const [csvFileName, setCsvFileName] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' })
  const [categories, setCategories] = useState<string[]>(DEFAULT_USER_CATEGORIES)
  const [fullCategories, setFullCategories] = useState<UserCategory[]>([])
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set())
  const [isBulkProcessing, setIsBulkProcessing] = useState(false)

  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    displayName: '',
    role: 'user',
    isActive: true,
    isAdmin: false,
    username: '',
    bio: '',
    profilePicture: '',
    category: '',
    isFeatured: false,
    isTrending: false,
    tags: '',
  })

  const { toast } = useToast()

  useEffect(() => {
    void fetchUsers()
    void loadCategories()
  }, [])

  useEffect(() => {
    const filtered = users.filter(user =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredUsers(filtered)
  }, [users, searchTerm])

  const loadCategories = async () => {
    try {
      const categoryList = await getUserCategories()
      setFullCategories(categoryList)
      if (categoryList.length > 0) {
        setCategories(categoryList.map((item) => item.name))
      }
    } catch (error) {
      console.error('Error loading categories:', error)
      setCategories(DEFAULT_USER_CATEGORIES)
    }
  }

  const handleAddCategory = async (name: string) => {
    try {
      await ensureUserCategory(name)
      await loadCategories()
      toast({ title: "Success", description: "Category added" })
    } catch (error) {
      toast({ title: "Error", description: "Failed to add category", variant: "destructive" })
    }
  }

  const handleDeleteCategory = async (slug: string) => {
    try {
      await deleteUserCategory(slug)
      await loadCategories()
      toast({ title: "Success", description: "Category removed" })
    } catch (error) {
      toast({ title: "Error", description: "Failed to remove category", variant: "destructive" })
    }
  }

  const handleGenerateBio = async () => {
    if (!formData.displayName && !formData.category) {
      toast({
        title: "Information missing",
        description: "Please provide a name or category first.",
        variant: "destructive"
      })
      return
    }

    try {
      setIsGeneratingBio(true)
      const response = await fetch('/api/generate-bio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.displayName,
          category: formData.category,
          currentBio: formData.bio
        })
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Generation failed")

      setFormData(prev => ({ ...prev, bio: data.bio }))
      toast({ title: "Bio generated", description: "AI bio has been created." })
    } catch (error: any) {
      console.error("Bio generation error:", error)
      toast({
        title: "Error",
        description: error.message || "Could not generate bio at this time.",
        variant: "destructive"
      })
    } finally {
      setIsGeneratingBio(false)
    }
  }

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const usersData = await getAllUsers()
      setUsers(usersData)
    } catch (error) {
      console.error('Error fetching users:', error)
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleBulkAI = async () => {
    if (selectedUserIds.size === 0) return
    
    setIsBulkProcessing(true)
    toast({
      title: "Bulk processing...",
      description: `Processing ${selectedUserIds.size} users using AI. Please don't close this page.`,
    })

    const selectedUsers = users.filter(u => selectedUserIds.has(u.id!))
    let successCount = 0
    let failCount = 0

    for (const user of selectedUsers) {
      try {
        const response = await fetch('/api/generate-bio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: user.displayName,
            currentBio: user.bio,
            categories: categories,
            autoChooseCategory: true
          })
        })

        const data = await response.json()
        if (!response.ok) throw new Error(data.error || "API error")

        await updateUser(user.id!, {
          bio: data.bio || user.bio,
          category: data.category || user.category
        })
        successCount++
      } catch (error) {
        console.error(`Error processing user ${user.id}:`, error)
        failCount++
      }
    }

    await fetchUsers()
    setSelectedUserIds(new Set())
    setIsBulkProcessing(false)
    
    toast({
      title: "Bulk processing complete",
      description: `Successfully processed ${successCount} users. ${failCount > 0 ? `${failCount} failed.` : ''}`,
    })
  }

  const toggleSelectAll = () => {
    if (selectedUserIds.size === filteredUsers.length) {
      setSelectedUserIds(new Set())
    } else {
      setSelectedUserIds(new Set(filteredUsers.map(u => u.id!)))
    }
  }

  const toggleSelectUser = (userId: string) => {
    const newSelected = new Set(selectedUserIds)
    if (newSelected.has(userId)) {
      newSelected.delete(userId)
    } else {
      newSelected.add(userId)
    }
    setSelectedUserIds(newSelected)
  }

  const sortData = (key: string) => {
    setSortConfig({
      key: key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc',
    })
  }

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const order = sortConfig.direction === 'asc' ? 1 : -1
    if (!sortConfig.key) return 0

    if (sortConfig.key === 'isAdmin') {
      return ((a.isAdmin ? 1 : 0) - (b.isAdmin ? 1 : 0)) * order
    }
    if (sortConfig.key === 'createdAt') {
      const dateA = a.createdAt instanceof Timestamp ? a.createdAt.toDate() : new Date(a.createdAt)
      const dateB = b.createdAt instanceof Timestamp ? b.createdAt.toDate() : new Date(b.createdAt)
      return (dateA.getTime() - dateB.getTime()) * order
    }

    const valA = String(a[sortConfig.key as keyof User] || '')
    const valB = String(b[sortConfig.key as keyof User] || '')
    return valA.localeCompare(valB) * order
  })

  const resetForm = () => {
    setFormData({
      email: '',
      displayName: '',
      role: 'user',
      isActive: true,
      isAdmin: false,
      username: '',
      bio: '',
      profilePicture: '',
      category: '',
      isFeatured: false,
      isTrending: false,
      tags: '',
    })
  }

  const openEditModal = (user: User) => {
    setSelectedUser(user)
    setFormData({
      email: user.email,
      displayName: user.displayName || '',
      role: user.role,
      isActive: user.isActive,
      isAdmin: user.isAdmin || false,
      username: user.username || '',
      bio: user.bio || '',
      profilePicture: user.profilePicture || '',
      category: user.category || '',
      isFeatured: user.isFeatured || false,
      isTrending: user.isTrending || false,
      tags: (user.tags || []).join(', '),
    })
    setIsEditModalOpen(true)
  }

  const openCreateModal = () => {
    setSelectedUser(null)
    resetForm()
    setIsCreateModalOpen(true)
  }

  const handleCreate = async () => {
    if (!formData.email.trim()) {
      toast({
        title: "Validation Error",
        description: "Email is required",
        variant: "destructive",
      })
      return
    }

    if (!formData.displayName.trim()) {
      toast({
        title: "Validation Error",
        description: "Display name is required",
        variant: "destructive",
      })
      return
    }

    try {
      await createUser({
        email: formData.email.trim(),
        displayName: formData.displayName.trim(),
        emailVerified: false,
        isActive: formData.isActive,
        isAdmin: formData.isAdmin,
        role: formData.role,
        metadata: {
          signUpMethod: 'email'
        },
        username: formData.username.trim(),
        bio: formData.bio.trim(),
        profilePicture: formData.profilePicture.trim(),
        category: formData.category,
        slug: createProfileSlug(formData.username || formData.displayName),
        links: [],
        socialLinks: [],
        theme: 'default',
        isFeatured: formData.isFeatured,
        isTrending: formData.isTrending,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
      })

      toast({
        title: "Success",
        description: "User created successfully",
      })

      setIsCreateModalOpen(false)
      resetForm()
      void fetchUsers()
    } catch (error) {
      console.error('Error creating user:', error)
      toast({
        title: "Error",
        description: "Failed to create user",
        variant: "destructive",
      })
    }
  }

  const handleUpdate = async () => {
    if (!selectedUser?.id) return

    try {
      await updateUser(selectedUser.id, {
        email: formData.email,
        displayName: formData.displayName,
        role: formData.role,
        isActive: formData.isActive,
        isAdmin: formData.isAdmin,
        username: formData.username.trim(),
        bio: formData.bio.trim(),
        profilePicture: formData.profilePicture.trim(),
        category: formData.category,
        slug: createProfileSlug(formData.username || formData.displayName),
        isFeatured: formData.isFeatured,
        isTrending: formData.isTrending,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
      })

      toast({
        title: "Success",
        description: "User updated successfully",
      })

      setIsEditModalOpen(false)
      setSelectedUser(null)
      resetForm()
      void fetchUsers()
    } catch (error) {
      console.error('Error updating user:', error)
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (user: User) => {
    try {
      await deleteUser(user.id!)

      toast({
        title: "Success",
        description: "User deleted successfully",
      })

      void fetchUsers()
    } catch (error) {
      console.error('Error deleting user:', error)
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      })
    }
  }

  const toggleAdminStatus = async (user: User, isAdmin: boolean) => {
    try {
      await updateUser(user.id!, { isAdmin })
      setUsers(users.map(u =>
        u.id === user.id ? { ...u, isAdmin } : u
      ))

      toast({
        title: "Success",
        description: `User ${isAdmin ? 'promoted to' : 'removed from'} admin`,
      })
    } catch (error) {
      console.error('Error updating admin status:', error)
      toast({
        title: "Error",
        description: "Failed to update admin status",
        variant: "destructive",
      })
    }
  }

  const handleInlineUpdate = async (userId: string, updates: Partial<User>) => {
    try {
      await updateUser(userId, updates)
      setUsers(prevUsers => prevUsers.map(u => 
        u.id === userId ? { ...u, ...updates } : u
      ))
      toast({
        title: "Success",
        description: "User updated",
      })
    } catch (error) {
      console.error('Error in inline update:', error)
      toast({
        title: "Error",
        description: "Update failed",
        variant: "destructive",
      })
    }
  }

  const formatDate = (timestamp: any) => {
    if (timestamp instanceof Timestamp) {
      return timestamp.toDate().toLocaleDateString()
    }
    return 'N/A'
  }

  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const parseBooleanValue = (value: string | undefined, fallback: boolean) => {
    if (value === undefined || value === null || value.trim() === '') {
      return fallback
    }

    const normalizedValue = value.trim().toLowerCase()

    if (['true', '1', 'yes', 'y'].includes(normalizedValue)) {
      return true
    }

    if (['false', '0', 'no', 'n'].includes(normalizedValue)) {
      return false
    }

    return fallback
  }

  const normalizeCsvHeader = (value: string) =>
    value.trim().toLowerCase().replace(/[\s-]+/g, '')

  const createProfileSlug = (value: string) =>
    value
      .trim()
      .toLowerCase()
      .replace(/^@/, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

  const parseCsvText = (csvText: string) => {
    const rows: string[][] = []
    let currentValue = ''
    let currentRow: string[] = []
    let isInQuotes = false

    for (let index = 0; index < csvText.length; index += 1) {
      const character = csvText[index]
      const nextCharacter = csvText[index + 1]

      if (character === '"') {
        if (isInQuotes && nextCharacter === '"') {
          currentValue += '"'
          index += 1
        } else {
          isInQuotes = !isInQuotes
        }
        continue
      }

      if (character === ',' && !isInQuotes) {
        currentRow.push(currentValue.trim())
        currentValue = ''
        continue
      }

      if ((character === '\n' || character === '\r') && !isInQuotes) {
        if (character === '\r' && nextCharacter === '\n') {
          index += 1
        }

        currentRow.push(currentValue.trim())
        const hasValues = currentRow.some((value) => value !== '')
        if (hasValues) {
          rows.push(currentRow)
        }

        currentValue = ''
        currentRow = []
        continue
      }

      currentValue += character
    }

    if (currentValue !== '' || currentRow.length > 0) {
      currentRow.push(currentValue.trim())
      const hasValues = currentRow.some((value) => value !== '')
      if (hasValues) {
        rows.push(currentRow)
      }
    }

    if (rows.length < 2) {
      throw new Error('CSV must include a header row and at least one data row.')
    }

    const headers = rows[0].map(normalizeCsvHeader)
    const requiredHeaders = ['email', 'displayname']
    const missingHeaders = requiredHeaders.filter((header) => !headers.includes(header))

    if (missingHeaders.length > 0) {
      throw new Error(`Missing required CSV columns: ${missingHeaders.join(', ')}`)
    }

    return rows.slice(1).map((row, rowIndex) => {
      const record = headers.reduce<Record<string, string>>((accumulator, header, headerIndex) => {
        accumulator[header] = row[headerIndex]?.trim() ?? ''
        return accumulator
      }, {})

      return {
        rowNumber: rowIndex + 2,
        email: record.email,
        displayName: record.displayname,
        username: record.username,
        bio: record.bio,
        profilePicture: record.profilepicture || record.avatarurl,
        category: record.category,
        role: (record.role || 'user') as UserFormData['role'],
        isActive: parseBooleanValue(record.isactive, true),
        isAdmin: parseBooleanValue(record.isadmin, false),
      }
    })
  }

  const handleDownloadCsv = () => {
    try {
      const dataToExport = searchTerm ? filteredUsers : users
      
      if (dataToExport.length === 0) {
        toast({
          title: "No data",
          description: "There are no users to export.",
          variant: "destructive",
        })
        return
      }

      const headers = [
        "ID",
        "Email",
        "Display Name",
        "Username",
        "Role",
        "Is Active",
        "Is Admin",
        "Category",
        "Created At",
        "Bio",
        "Tags"
      ]

      const csvRows = dataToExport.map(user => {
        const createdAt = user.createdAt instanceof Timestamp 
          ? user.createdAt.toDate().toISOString() 
          : 'N/A'
        
        const tags = Array.isArray(user.tags) ? user.tags.join(';') : ''
        
        return [
          user.id || '',
          user.email || '',
          user.displayName || '',
          user.username || '',
          user.role || 'user',
          user.isActive ? '1' : '0',
          user.isAdmin ? '1' : '0',
          user.category || '',
          createdAt,
          (user.bio || '').replace(/"/g, '""'),
          tags
        ].map(value => {
          const stringValue = String(value ?? "")
          return `"${stringValue.replace(/"/g, '""')}"`
        }).join(',')
      })

      const csvContent = [headers.join(','), ...csvRows].join('\n')
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.setAttribute('href', url)
      link.setAttribute('download', `users_export_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Export Success",
        description: `Exported ${dataToExport.length} users to CSV.`,
      })
    } catch (error) {
      console.error('Error exporting CSV:', error)
      toast({
        title: "Export Error",
        description: "Failed to export users to CSV.",
        variant: "destructive",
      })
    }
  }

  const handleDownloadLoopsCsv = () => {
    try {
      const dataToExport = searchTerm ? filteredUsers : users
      
      if (dataToExport.length === 0) {
        toast({
          title: "No data",
          description: "There are no users to export.",
          variant: "destructive",
        })
        return
      }

      const headers = [
        "First Name",
        "Last Name",
        "Email",
        "User Group"
      ]

      const csvRows = dataToExport.map(user => {
        const nameParts = (user.displayName || '').trim().split(/\s+/)
        const firstName = nameParts[0] || ''
        const lastName = nameParts.slice(1).join(' ') || ''
        
        return [
          firstName,
          lastName,
          user.email || '',
          user.category || user.role || 'User'
        ].map(value => {
          const stringValue = String(value ?? "")
          return `"${stringValue.replace(/"/g, '""')}"`
        }).join(',')
      })

      const csvContent = [headers.join(','), ...csvRows].join('\n')
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.setAttribute('href', url)
      link.setAttribute('download', `loops_export_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Loops Export Success",
        description: `Exported ${dataToExport.length} users in Loops format.`,
      })
    } catch (error) {
      console.error('Error exporting Loops CSV:', error)
      toast({
        title: "Export Error",
        description: "Failed to export users for Loops.",
        variant: "destructive",
      })
    }
  }

  const handleCsvUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    setCsvFileName(file.name)

    try {
      setIsImporting(true)
      const csvText = await file.text()
      const parsedRows = parseCsvText(csvText)

      const failures: Array<{ rowNumber: number; reason: string }> = []
      let createdCount = 0

      for (const row of parsedRows) {
        if (!row.email.trim() || !row.displayName.trim()) {
          failures.push({
            rowNumber: row.rowNumber,
            reason: 'Email and displayName are required.',
          })
          continue
        }

        if (!['user', 'admin', 'moderator'].includes(row.role)) {
          failures.push({
            rowNumber: row.rowNumber,
            reason: `Unsupported role "${row.role}".`,
          })
          continue
        }

        try {
          await createUser({
            email: row.email.trim(),
            displayName: row.displayName.trim(),
            emailVerified: false,
            isActive: row.isActive,
            isAdmin: row.isAdmin,
            role: row.role,
            metadata: {
              signUpMethod: 'email'
            },
            username: row.username.trim(),
            bio: row.bio?.trim() || '',
            profilePicture: row.profilePicture?.trim() || '',
            category: row.category?.trim() || '',
            slug: createProfileSlug(row.username || row.displayName),
            links: [],
            socialLinks: [],
            theme: 'default'
          })

          createdCount += 1
        } catch (error) {
          failures.push({
            rowNumber: row.rowNumber,
            reason: error instanceof Error ? error.message : 'Unknown import error.',
          })
        }
      }

      if (createdCount > 0) {
        await fetchUsers()
      }

      if (failures.length === 0) {
        toast({
          title: "Import complete",
          description: `Created ${createdCount} users from ${file.name}.`,
        })
      } else {
        const failureSummary = failures
          .slice(0, 3)
          .map((failure) => `Row ${failure.rowNumber}: ${failure.reason}`)
          .join(' ')

        toast({
          title: createdCount > 0 ? "Import completed with issues" : "Import failed",
          description: `${createdCount} created, ${failures.length} failed. ${failureSummary}`,
          variant: failures.length === parsedRows.length ? "destructive" : undefined,
        })
      }
    } catch (error) {
      console.error('Error importing CSV users:', error)
      toast({
        title: "Import error",
        description: error instanceof Error ? error.message : "Failed to import CSV users",
        variant: "destructive",
      })
    } finally {
      setIsImporting(false)
      event.target.value = ''
    }
  }

  if (loading) {
    return <div className="p-8">Loading users...</div>
  }

  return (
    <div className="w-full min-w-0 space-y-6 overflow-x-hidden">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold">Users ({users.length})</h1>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {selectedUserIds.size > 0 && (
            <div className="flex items-center gap-2 mr-4 pr-4 border-r">
              <span className="text-xs font-medium whitespace-nowrap">{selectedUserIds.size} selected</span>
              <Button 
                size="sm" 
                onClick={handleBulkAI} 
                disabled={isBulkProcessing}
                variant="outline"
                className="h-8 border-primary text-primary hover:bg-primary hover:text-white"
              >
                {isBulkProcessing ? (
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-3 w-3" />
                )}
                Auto Bio/Category
              </Button>
            </div>
          )}
          <div className="relative min-w-0">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full min-w-0 pl-8 sm:w-64"
            />
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={handleCsvUpload}
          />
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="w-full sm:w-auto"
          >
            <Upload className="mr-2 h-4 w-4" />
            {isImporting ? 'Importing...' : 'Import'}
          </Button>
          <Button
            variant="outline"
            onClick={handleDownloadCsv}
            className="w-full sm:w-auto"
          >
            <Download className="mr-2 h-4 w-4" />
            Export All
          </Button>
          <Button
            variant="outline"
            onClick={handleDownloadLoopsCsv}
            className="w-full sm:w-auto bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200"
          >
            <Download className="mr-2 h-4 w-4" />
            Loops Export
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsCategoryModalOpen(true)}
            className="w-full sm:w-auto"
          >
            <Settings2 className="mr-2 h-4 w-4" />
            Categories
          </Button>
          <Button onClick={openCreateModal} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>

      <CategoryManagerModal
        isOpen={isCategoryModalOpen}
        onOpenChange={setIsCategoryModalOpen}
        categories={fullCategories}
        onAddCategory={handleAddCategory}
        onDeleteCategory={handleDeleteCategory}
      />

      <UserFormModal
        isOpen={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        isCreate={true}
        formData={formData}
        categories={categories}
        onFormChange={handleFormChange}
        onSubmit={handleCreate}
        isGeneratingBio={isGeneratingBio}
        onGenerateBio={handleGenerateBio}
      />

      <UserFormModal
        isOpen={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        isCreate={false}
        formData={formData}
        categories={categories}
        onFormChange={handleFormChange}
        onSubmit={handleUpdate}
        isGeneratingBio={isGeneratingBio}
        onGenerateBio={handleGenerateBio}
      />

      <div className="space-y-3 md:hidden">
        {sortedUsers.map((user) => (
          <div key={user.id} className="space-y-3 rounded-lg border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex gap-3 min-w-0">
                <Checkbox 
                  checked={selectedUserIds.has(user.id!)}
                  onCheckedChange={() => toggleSelectUser(user.id!)}
                  className="mt-1"
                />
                <div className="min-w-0">
                  <p className="truncate font-medium">{user.displayName || 'No name'}</p>
                  <p className="truncate text-sm text-muted-foreground">{user.email}</p>
                  <p className="text-sm text-muted-foreground">@{user.username?.replace('@', '') || 'n-a'}</p>
                </div>
              </div>
              <Badge variant={user.isActive ? 'default' : 'secondary'}>
                {user.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant={user.role === 'admin' ? 'destructive' : user.role === 'moderator' ? 'secondary' : 'default'}>{user.role}</Badge>
              {user.category ? <Badge variant="outline">{user.category}</Badge> : null}
              <Badge variant="outline">Joined {formatDate(user.createdAt)}</Badge>
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Admin</span>
                <Switch
                  checked={user.isAdmin || false}
                  onCheckedChange={(checked) => toggleAdminStatus(user, checked)}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" onClick={() => openEditModal(user)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-800">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the user
                        and their profile data.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(user)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-md border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox 
                  checked={selectedUserIds.size === filteredUsers.length && filteredUsers.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead className="cursor-pointer text-xs" onClick={() => sortData('displayName')}>
                Name {sortConfig.key === 'displayName' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead className="cursor-pointer text-xs" onClick={() => sortData('email')}>
                Email {sortConfig.key === 'email' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead className="text-xs">Username</TableHead>
              <TableHead className="text-xs">Category</TableHead>
              <TableHead className="text-xs">Bio</TableHead>
              <TableHead className="text-xs">Profile Link</TableHead>
              <TableHead className="cursor-pointer text-xs" onClick={() => sortData('createdAt')}>
                Joined {sortConfig.key === 'createdAt' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead className="cursor-pointer text-xs" onClick={() => sortData('isAdmin')}>
                Admin {sortConfig.key === 'isAdmin' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead className="text-xs">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <Checkbox 
                    checked={selectedUserIds.has(user.id!)}
                    onCheckedChange={() => toggleSelectUser(user.id!)}
                  />
                </TableCell>
                <TableCell className="text-xs">
                  <div className="flex items-center space-x-2">
                    {user.profilePicture && (
                      <img
                        src={user.profilePicture}
                        alt={user.displayName || 'User'}
                        className="h-6 w-6 rounded-full"
                      />
                    )}
                    <span>{user.displayName || 'No name'}</span>
                  </div>
                </TableCell>
                <TableCell className="text-xs">{user.email}</TableCell>
                <TableCell className="text-xs">
                  <Input 
                    defaultValue={user.username || ''}
                    onBlur={(e) => {
                      const newUsername = e.target.value.trim().replace(/^@/, '')
                      if (newUsername !== (user.username || '').replace(/^@/, '')) {
                        handleInlineUpdate(user.id!, { 
                          username: newUsername ? `@${newUsername}` : '',
                          slug: createProfileSlug(newUsername || user.displayName || '')
                        })
                      }
                    }}
                    className="h-8 w-[120px] text-[11px]"
                    placeholder="@username"
                  />
                </TableCell>
                <TableCell className="text-xs">
                  <Select
                    value={user.category || 'unselected'}
                    onValueChange={(value) => handleInlineUpdate(user.id!, { category: value === 'unselected' ? '' : value })}
                  >
                    <SelectTrigger className="h-8 w-[140px] text-[11px]">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unselected">None</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-xs">
                  <Input 
                    defaultValue={user.bio || ''}
                    onBlur={(e) => {
                      if (e.target.value !== (user.bio || '')) {
                        handleInlineUpdate(user.id!, { bio: e.target.value })
                      }
                    }}
                    className="h-8 w-[200px] text-[11px]"
                    placeholder="User bio..."
                  />
                </TableCell>
                <TableCell className="text-xs">
                  {user.username ? (
                    <a
                      href={`/${user.username.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      /{user.username.replace('@', '')}
                    </a>
                  ) : (
                    'N/A'
                  )}
                </TableCell>
                <TableCell className="text-xs">{formatDate(user.createdAt)}</TableCell>
                <TableCell>
                  <Switch
                    checked={user.isAdmin || false}
                    onCheckedChange={(checked) => toggleAdminStatus(user, checked)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditModal(user)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-800">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the user
                            and their profile data.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(user)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
