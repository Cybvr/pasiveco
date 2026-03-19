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
import { Trash2, Edit, Plus, Search, Upload } from "lucide-react"
import { getAllUsers, updateUser, deleteUser, createUser, type User } from "@/services/userService"
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
  isPublic: boolean;
}

interface UserFormModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isCreate: boolean;
  formData: UserFormData;
  onFormChange: (field: string, value: any) => void;
  onSubmit: () => void;
}

// Move the modal component outside to prevent recreation
const UserFormModal = ({ 
  isOpen, 
  onOpenChange, 
  isCreate, 
  formData, 
  onFormChange, 
  onSubmit 
}: UserFormModalProps) => (
  <Dialog open={isOpen} onOpenChange={onOpenChange}>
    <DialogContent className="w-[calc(100%-2rem)] sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>{isCreate ? 'Create New User' : 'Edit User'}</DialogTitle>
        <DialogDescription>
          {isCreate ? 'Add a new user to the system.' : 'Make changes to the user account.'}
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="email" className="text-right">Email *</Label>
          <Input
            id="email"
            value={formData.email}
            onChange={(e) => onFormChange('email', e.target.value)}
            className="col-span-3"
            type="email"
            required
            placeholder="user@example.com"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="displayName" className="text-right">Name *</Label>
          <Input
            id="displayName"
            value={formData.displayName}
            onChange={(e) => onFormChange('displayName', e.target.value)}
            className="col-span-3"
            required
            placeholder="User's full name"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="username" className="text-right">Username</Label>
          <Input
            id="username"
            value={formData.username}
            onChange={(e) => onFormChange('username', e.target.value)}
            className="col-span-3"
            placeholder="@username"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="role" className="text-right">Role</Label>
          <Select value={formData.role} onValueChange={(value: any) => onFormChange('role', value)}>
            <SelectTrigger className="col-span-3">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="moderator">Moderator</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="bio" className="text-right">Bio</Label>
          <Textarea
            id="bio"
            value={formData.bio}
            onChange={(e) => onFormChange('bio', e.target.value)}
            className="col-span-3"
            rows={3}
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="profilePicture" className="text-right">Avatar URL</Label>
          <Input
            id="profilePicture"
            value={formData.profilePicture}
            onChange={(e) => onFormChange('profilePicture', e.target.value)}
            className="col-span-3"
            type="url"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label className="text-right">Status</Label>
          <div className="col-span-3 flex items-center space-x-2">
            <Switch
              checked={formData.isActive}
              onCheckedChange={(checked) => onFormChange('isActive', checked)}
            />
            <span className="text-sm">{formData.isActive ? 'Active' : 'Inactive'}</span>
          </div>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label className="text-right">Public Profile</Label>
          <div className="col-span-3 flex items-center space-x-2">
            <Switch
              checked={formData.isPublic}
              onCheckedChange={(checked) => onFormChange('isPublic', checked)}
            />
            <span className="text-sm">{formData.isPublic ? 'Public' : 'Private'}</span>
          </div>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label className="text-right">Admin</Label>
          <div className="col-span-3 flex items-center space-x-2">
            <Switch
              checked={formData.isAdmin}
              onCheckedChange={(checked) => onFormChange('isAdmin', checked)}
            />
            <span className="text-sm">{formData.isAdmin ? 'Admin' : 'Regular User'}</span>
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button type="submit" onClick={onSubmit}>
          {isCreate ? 'Create User' : 'Save Changes'}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
)

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [isImporting, setIsImporting] = useState(false)
  const [csvFileName, setCsvFileName] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' })
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  // Form states
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    displayName: '',
    role: 'user',
    isActive: true,
    isAdmin: false,
    username: '',
    bio: '',
    profilePicture: '',
    isPublic: true
  })

  const { toast } = useToast()

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    // Filter users based on search term
    const filtered = users.filter(user =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
user.username?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredUsers(filtered)
  }, [users, searchTerm])

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
      isPublic: true
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
      isPublic: user.isPublic ?? true
    })
    setIsEditModalOpen(true)
  }

  const openCreateModal = () => {
    setSelectedUser(null)
    resetForm()
    setIsCreateModalOpen(true)
  }

  const handleCreate = async () => {
    // Validate required fields
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
      // Create user
      const userId = await createUser({
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
        slug: createProfileSlug(formData.username || formData.displayName),
        isPublic: formData.isPublic,
        links: [],
        socialLinks: [],
        theme: 'default'
      })



      toast({
        title: "Success",
        description: "User created successfully",
      })

      setIsCreateModalOpen(false)
      resetForm()
      fetchUsers()
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
      // Update user
      await updateUser(selectedUser.id, {
        email: formData.email,
        displayName: formData.displayName,
        role: formData.role,
        isActive: formData.isActive,
        isAdmin: formData.isAdmin,
        username: formData.username.trim(),
        bio: formData.bio.trim(),
        profilePicture: formData.profilePicture.trim(),
        slug: createProfileSlug(formData.username || formData.displayName),
        isPublic: formData.isPublic
      })



      toast({
        title: "Success",
        description: "User updated successfully",
      })

      setIsEditModalOpen(false)
      setSelectedUser(null)
      resetForm()
      fetchUsers()
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

      fetchUsers()
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
        role: (record.role || 'user') as UserFormData['role'],
        isActive: parseBooleanValue(record.isactive, true),
        isAdmin: parseBooleanValue(record.isadmin, false),
        isPublic: parseBooleanValue(record.ispublic, true),
      }
    })
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
          const userId = await createUser({
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
            slug: createProfileSlug(row.username || row.displayName),
            isPublic: row.isPublic,
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
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold">Users ({users.length})</h1>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-full sm:w-64"
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
          >
            <Upload className="h-4 w-4 mr-2" />
            {isImporting ? 'Importing CSV...' : 'Import CSV'}
          </Button>
          <Button onClick={openCreateModal}>
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        CSV columns: <code>email</code>, <code>displayName</code>, optional <code>username</code>, <code>bio</code>, <code>profilePicture</code>, <code>role</code>, <code>isActive</code>, <code>isAdmin</code>, and <code>isPublic</code>.
        {csvFileName ? ` Last selected: ${csvFileName}.` : ''}
      </p>

      {/* Create Modal */}
      <UserFormModal 
        isOpen={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        isCreate={true}
        formData={formData}
        onFormChange={handleFormChange}
        onSubmit={handleCreate}
      />

      {/* Edit Modal */}
      <UserFormModal 
        isOpen={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        isCreate={false}
        formData={formData}
        onFormChange={handleFormChange}
        onSubmit={handleUpdate}
      />

      <div className="space-y-3 md:hidden">
        {sortedUsers.map((user) => (
          <div key={user.id} className="rounded-lg border bg-card p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium truncate">{user.displayName || 'No name'}</p>
                <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                <p className="text-sm text-muted-foreground">@{user.username?.replace('@', '') || 'n-a'}</p>
              </div>
              <Badge variant={user.isActive ? 'default' : 'secondary'}>
                {user.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant={user.role === 'admin' ? 'destructive' : user.role === 'moderator' ? 'secondary' : 'default'}>{user.role}</Badge>
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

      <div className="hidden rounded-md border overflow-x-auto md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs cursor-pointer" onClick={() => sortData('displayName')}>
                Name {sortConfig.key === 'displayName' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead className="text-xs cursor-pointer" onClick={() => sortData('email')}>
                Email {sortConfig.key === 'email' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead className="text-xs">Username</TableHead>
              <TableHead className="text-xs">Profile Link</TableHead>
              <TableHead className="text-xs cursor-pointer" onClick={() => sortData('role')}>
                Role {sortConfig.key === 'role' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead className="text-xs">Status</TableHead>
              <TableHead className="text-xs cursor-pointer" onClick={() => sortData('createdAt')}>
                Joined {sortConfig.key === 'createdAt' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead className="text-xs cursor-pointer" onClick={() => sortData('isAdmin')}>
                Admin {sortConfig.key === 'isAdmin' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead className="text-xs">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="text-xs">
                  <div className="flex items-center space-x-2">
                    {user.profilePicture && (
                      <img 
                        src={user.profilePicture}
                        alt={user.displayName || 'User'} 
                        className="w-6 h-6 rounded-full"
                      />
                    )}
                    <span>{user.displayName || 'No name'}</span>
                  </div>
                </TableCell>
                <TableCell className="text-xs">{user.email}</TableCell>
                <TableCell className="text-xs">{user.username || 'N/A'}</TableCell>
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
                <TableCell className="text-xs">
                  <Badge variant={user.role === 'admin' ? 'destructive' : user.role === 'moderator' ? 'secondary' : 'default'}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs">
                  <Badge variant={user.isActive ? 'default' : 'secondary'}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </Badge>
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
