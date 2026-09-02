import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { useApi } from '../hooks/useApi'
import { useAuth } from '../context/AuthContext'
import { ArrowLeft, Plus, Download, Mail, MessageCircle, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import 'jspdf/dist/jspdf.umd.min.js'

interface DivisionalHead {
  id: string
  email: string
  full_name: string
  title: string
  role: string
  division_id: string
}

interface Meeting {
  id: string
  meeting_number?: number
  title: string
  meeting_date: string
  location: string
  description?: string
  responsible_person_id?: string
}

interface ActionItem {
  id: string
  title: string
  description: string
  status: string
  priority: string
  target_date: string
  full_name: string
}

export default function MeetingDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { request } = useApi()
  const { user } = useAuth()
  const titleInputRef = useRef<HTMLInputElement>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [divisionalHeads, setDivisionalHeads] = useState<DivisionalHead[]>([])
  const [meeting, setMeeting] = useState<Meeting | null>(null)
  const [actionItems, setActionItems] = useState<ActionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [titleSuggestions, setTitleSuggestions] = useState<string[]>([])
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null)
  const [statusUpdateData, setStatusUpdateData] = useState<{ comments: string; attachment: File | null }>({ comments: '', attachment: null })
  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    dueDate: '',
    assignedTo: ''
  })

  useEffect(() => {
    loadDivisionalHeads()
    loadMeetingAndItems()
  }, [])

  useEffect(() => {
    if (divisionalHeads.length > 0 && !newItem.assignedTo) {
      setNewItem(prev => ({ ...prev, assignedTo: divisionalHeads[0].id }))
    }
  }, [divisionalHeads])

  const loadMeetingAndItems = async () => {
    try {
      setLoading(true)
      const [meetingData, itemsData] = await Promise.all([
        request('GET', `/meetings/${id}`),
        request('GET', `/action-items?meetingId=${id}`)
      ])
      setMeeting(meetingData.meeting)
      setActionItems(itemsData.actionItems || [])
      // Set default due date to 7 days from meeting date and default responsible person
      if (meetingData.meeting) {
        setDefaultDueDate(meetingData.meeting.meeting_date)
        if (meetingData.meeting.responsible_person_id) {
          setNewItem(prev => ({ ...prev, assignedTo: meetingData.meeting.responsible_person_id }))
        }
      }
    } catch (error) {
      console.error('Failed to load meeting data:', error)
      toast.error('Failed to load meeting details')
    } finally {
      setLoading(false)
    }
  }

  const loadDivisionalHeads = async () => {
    try {
      const data = await request('GET', '/users/divisional-heads')
      setDivisionalHeads(data.users || [])
    } catch (error) {
      console.error('Failed to load divisional heads:', error)
    }
  }

  const setDefaultDueDate = (meetingDate: string) => {
    const date = new Date(meetingDate)
    date.setDate(date.getDate() + 7)
    const formattedDate = date.toISOString().split('T')[0]
    setNewItem(prev => ({ ...prev, dueDate: formattedDate }))
  }

  const handleAddActionItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newItem.title) {
      toast.error('Title is required')
      return
    }

    if (!newItem.assignedTo) {
      toast.error('Please assign this action item to someone')
      return
    }

    const selectedHead = divisionalHeads.find(h => h.id === newItem.assignedTo)
    if (!selectedHead) {
      toast.error('Invalid responsible person selected')
      return
    }

    try {
      const titleCase = newItem.title
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')

      await request('POST', `/action-items`, {
        title: titleCase,
        description: newItem.description,
        priority: newItem.priority,
        targetDate: newItem.dueDate || new Date().toISOString().split('T')[0],
        meetingId: id,
        responsibleUserId: newItem.assignedTo,
        responsibleDivisionId: selectedHead.division_id
      })

      setNewItem({ title: '', description: '', priority: 'MEDIUM', dueDate: '', assignedTo: divisionalHeads[0]?.id || '' })
      toast.success('Action item created!')
      loadMeetingAndItems()
      setTimeout(() => {
        titleInputRef.current?.focus()
      }, 500)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to create action item')
    }
  }

  const handleDeleteActionItem = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete the action item "${title}"?`)) {
      try {
        await request('DELETE', `/action-items/${id}`)
        toast.success('Action item deleted successfully!')
        loadMeetingAndItems()
      } catch (error) {
        toast.error('Failed to delete action item')
      }
    }
  }

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      'HIGH': 'text-red-600',
      'MEDIUM': 'text-yellow-600',
      'LOW': 'text-green-600'
    }
    return colors[priority] || 'text-slate-600'
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'OPEN': 'bg-yellow-100 text-yellow-700',
      'IN_PROGRESS': 'bg-blue-100 text-blue-700',
      'PENDING_REVIEW': 'bg-purple-100 text-purple-700',
      'COMPLETED': 'bg-green-100 text-green-700',
      'CLOSED': 'bg-slate-100 text-slate-700'
    }
    return colors[status] || 'bg-slate-100 text-slate-700'
  }

  const capitalizeTitle = (text: string) => {
    return text.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')
  }

  const handleTitleChange = (value: string) => {
    setNewItem({ ...newItem, title: value })
    if (value.trim()) {
      const filtered = actionItems
        .map(item => item.title)
        .filter(title => title.toLowerCase().includes(value.toLowerCase()) && title !== value)
      setTitleSuggestions(filtered.slice(0, 5))
    } else {
      setTitleSuggestions([])
    }
  }

  const selectSuggestion = (suggestion: string) => {
    setNewItem({ ...newItem, title: suggestion })
    setTitleSuggestions([])
  }

  const downloadExcel = () => {
    if (actionItems.length === 0) {
      toast.error('No action items to download')
      return
    }

    const wb = XLSX.utils.book_new()
    const ws: any = {}

    // Set column widths
    ws['!cols'] = [
      { wch: 8 },
      { wch: 20 },
      { wch: 30 },
      { wch: 15 },
      { wch: 15 },
      { wch: 12 },
      { wch: 12 },
      { wch: 18 }
    ]

    let rowNum = 1

    // Row 1: EXECUTIVE MEETING MINUTES header
    ws[`A${rowNum}`] = { t: 's', v: 'EXECUTIVE MEETING MINUTES', s: { font: { bold: true, sz: 14 }, fill: { fgColor: { rgb: 'D4E6F1' } }, alignment: { horizontal: 'left', vertical: 'center' } } }
    rowNum++

    // Row 2: Empty
    rowNum++

    // Row 3: Meeting details
    ws[`A${rowNum}`] = { t: 's', v: 'Meeting:', s: { font: { bold: true }, fill: { fgColor: { rgb: 'D4E6F1' } } } }
    ws[`B${rowNum}`] = { t: 's', v: meeting?.title }
    ws[`D${rowNum}`] = { t: 's', v: 'Date of Meeting:', s: { font: { bold: true }, fill: { fgColor: { rgb: 'D4E6F1' } } } }
    ws[`E${rowNum}`] = { t: 's', v: new Date(meeting?.meeting_date || '').toLocaleDateString() }
    rowNum++

    // Row 4: Location & Time
    ws[`A${rowNum}`] = { t: 's', v: 'Location:', s: { font: { bold: true }, fill: { fgColor: { rgb: 'D4E6F1' } } } }
    ws[`B${rowNum}`] = { t: 's', v: meeting?.location }
    ws[`D${rowNum}`] = { t: 's', v: 'Time:', s: { font: { bold: true }, fill: { fgColor: { rgb: 'D4E6F1' } } } }
    ws[`E${rowNum}`] = { t: 's', v: new Date().toLocaleTimeString() }
    rowNum++

    // Row 5: Generated & Total
    ws[`A${rowNum}`] = { t: 's', v: 'Generated:', s: { font: { bold: true }, fill: { fgColor: { rgb: 'D4E6F1' } } } }
    ws[`B${rowNum}`] = { t: 's', v: new Date().toLocaleDateString() }
    ws[`D${rowNum}`] = { t: 's', v: 'Total Action Items:', s: { font: { bold: true }, fill: { fgColor: { rgb: 'D4E6F1' } } } }
    ws[`E${rowNum}`] = { t: 'n', v: actionItems.length }
    rowNum++

    // Row 6: Empty
    rowNum++

    // Row 7: ACTION ITEMS SUMMARY
    ws[`A${rowNum}`] = { t: 's', v: 'ACTION ITEMS SUMMARY', s: { font: { bold: true }, fill: { fgColor: { rgb: 'D4E6F1' } } } }
    rowNum++

    // Row 8: Open
    ws[`A${rowNum}`] = { t: 's', v: 'Open', s: { font: { bold: true }, fill: { fgColor: { rgb: 'D4E6F1' } } } }
    ws[`B${rowNum}`] = { t: 'n', v: actionItems.filter(i => i.status === 'OPEN').length }
    rowNum++

    // Row 9: In Progress
    ws[`A${rowNum}`] = { t: 's', v: 'In Progress', s: { font: { bold: true }, fill: { fgColor: { rgb: 'D4E6F1' } } } }
    ws[`B${rowNum}`] = { t: 'n', v: actionItems.filter(i => i.status === 'IN_PROGRESS').length }
    rowNum++

    // Row 10: Completed
    ws[`A${rowNum}`] = { t: 's', v: 'Completed', s: { font: { bold: true }, fill: { fgColor: { rgb: 'D4E6F1' } } } }
    ws[`B${rowNum}`] = { t: 'n', v: actionItems.filter(i => i.status === 'COMPLETED').length }
    rowNum++

    // Row 11: Empty
    rowNum++

    // Row 12: Table Header
    const headers = ['S.NO.', 'TITLE', 'DESCRIPTION', 'DUE DATE', 'OWNER', 'PRIORITY', 'STATUS', 'REMARKS']
    headers.forEach((header, col) => {
      const colLetter = String.fromCharCode(65 + col)
      ws[`${colLetter}${rowNum}`] = { t: 's', v: header, s: { font: { bold: true, color: { rgb: 'FFFFFF' } }, fill: { fgColor: { rgb: '4A7BA7' } }, alignment: { horizontal: 'center' } } }
    })
    rowNum++

    // Action items rows
    actionItems.forEach((item, idx) => {
      const daysRemaining = Math.max(0, Math.ceil((new Date(item.target_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
      const bgColor = idx % 2 === 0 ? 'FFFFFF' : 'F0F0F0'

      ws[`A${rowNum}`] = { t: 'n', v: idx + 1, s: { fill: { fgColor: { rgb: bgColor } } } }
      ws[`B${rowNum}`] = { t: 's', v: item.title, s: { fill: { fgColor: { rgb: bgColor } } } }
      ws[`C${rowNum}`] = { t: 's', v: item.description, s: { fill: { fgColor: { rgb: bgColor } } } }
      ws[`D${rowNum}`] = { t: 's', v: new Date(item.target_date).toLocaleDateString(), s: { fill: { fgColor: { rgb: bgColor } } } }
      ws[`E${rowNum}`] = { t: 's', v: item.full_name, s: { fill: { fgColor: { rgb: bgColor } } } }
      ws[`F${rowNum}`] = { t: 's', v: item.priority, s: { fill: { fgColor: { rgb: bgColor } } } }
      ws[`G${rowNum}`] = { t: 's', v: item.status, s: { fill: { fgColor: { rgb: bgColor } } } }
      ws[`H${rowNum}`] = { t: 's', v: `Days remaining: ${daysRemaining}`, s: { fill: { fgColor: { rgb: bgColor } } } }
      rowNum++
    })

    ws['!ref'] = `A1:H${rowNum - 1}`
    XLSX.utils.book_append_sheet(wb, ws, 'Minutes')
    XLSX.writeFile(wb, `${meeting?.title || 'Meeting'}_Minutes_${new Date().getTime()}.xlsx`)
    toast.success('Excel file downloaded!')
  }

  const sendEmail = () => {
    if (actionItems.length === 0) {
      toast.error('No action items to send')
      return
    }
    const uniqueOwners = [...new Set(actionItems.map(item => item.full_name))]
    const owners = uniqueOwners.join(', ')
    const subject = `Action Items from ${meeting?.title}`
    const body = actionItems.map((item, idx) => `${idx + 1}. ${item.title} - Due: ${new Date(item.target_date).toLocaleDateString()} - Owner: ${item.full_name}`).join('%0A')
    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(actionItems.map((item, idx) => `${idx + 1}. ${item.title}\nDescription: ${item.description}\nDue: ${new Date(item.target_date).toLocaleDateString()}\nOwner: ${item.full_name}\nPriority: ${item.priority}\n`).join('\n'))}`
    window.location.href = mailtoLink
    toast.success('Email client opened')
  }

  const sendWhatsApp = () => {
    if (actionItems.length === 0) {
      toast.error('No action items to send')
      return
    }
    const uniqueOwners = [...new Set(actionItems.map(item => item.full_name))]
    const message = `Action Items from ${meeting?.title}:\n\n${actionItems.map((item, idx) => `${idx + 1}. ${item.title}\nDue: ${new Date(item.target_date).toLocaleDateString()}\nOwner: ${item.full_name}`).join('\n\n')}`
    const whatsappLink = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(whatsappLink, '_blank')
    toast.success('WhatsApp opened')
  }

  const downloadPDF = () => {
    if (actionItems.length === 0) {
      toast.error('No action items to download')
      return
    }

    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 12
    const maxWidth = pageWidth - (margin * 2)
    let yPosition = margin

    // Title
    doc.setFontSize(18)
    doc.setTextColor(33, 33, 33)
    doc.setFont(undefined, 'bold')
    doc.text('EXECUTIVE MEETING MINUTES', pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 12

    // Meeting Details Section
    doc.setFontSize(10)
    doc.setTextColor(59, 130, 246)
    doc.setFont(undefined, 'bold')
    doc.text('Meeting Details', margin, yPosition)
    yPosition += 6

    doc.setFontSize(9)
    doc.setTextColor(33, 33, 33)
    doc.setFont(undefined, 'normal')
    doc.text(`Meeting/Project Name:  ${meeting?.title}`, margin, yPosition)
    yPosition += 5
    doc.text(`Location:  ${meeting?.location}`, margin, yPosition)
    yPosition += 5
    doc.text(`Time:  ${new Date().toLocaleTimeString()}`, margin, yPosition)
    yPosition += 5
    doc.text(`Generated:  ${new Date().toLocaleDateString()}`, margin, yPosition)
    yPosition += 8

    // Action Items Summary Section
    doc.setFontSize(10)
    doc.setTextColor(59, 130, 246)
    doc.setFont(undefined, 'bold')
    doc.text('Action Items Summary', margin, yPosition)
    yPosition += 6

    doc.setFontSize(9)
    doc.setTextColor(33, 33, 33)
    doc.setFont(undefined, 'normal')
    doc.text(`Total Items: ${actionItems.length}  |  Open: ${actionItems.filter(i => i.status === 'OPEN').length}  |  In Progress: ${actionItems.filter(i => i.status === 'IN_PROGRESS').length}  |  Completed: ${actionItems.filter(i => i.status === 'COMPLETED').length}`, margin, yPosition)
    yPosition += 10

    // Action Items Section
    doc.setFontSize(10)
    doc.setTextColor(59, 130, 246)
    doc.setFont(undefined, 'bold')
    doc.text('Action Items', margin, yPosition)
    yPosition += 8

    // Action Items List with Descriptions
    doc.setFontSize(9)

    actionItems.forEach((item, idx) => {
      if (yPosition > pageHeight - 20) {
        doc.addPage()
        yPosition = margin
      }

      // Item number and title (BOLD)
      doc.setFont(undefined, 'bold')
      doc.setTextColor(33, 33, 33)
      const titleText = doc.splitTextToSize(`${idx + 1}. ${item.title}`, maxWidth - 4)
      doc.text(titleText, margin + 2, yPosition)
      yPosition += titleText.length * 5 + 1

      // Description
      doc.setFont(undefined, 'normal')
      doc.setTextColor(107, 114, 128)
      doc.setFontSize(8)
      const descText = doc.splitTextToSize(`Description: ${item.description}`, maxWidth - 4)
      doc.text(descText, margin + 2, yPosition)
      yPosition += descText.length * 4 + 1

      // Details row
      doc.setFontSize(8)
      doc.setTextColor(55, 65, 81)
      const daysRemaining = Math.max(0, Math.ceil((new Date(item.target_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
      const detailsText = `Responsible Person: ${item.full_name}  |  Priority: ${item.priority}  |  Due Date: ${new Date(item.target_date).toLocaleDateString()}  |  Days Remaining: ${daysRemaining}`
      doc.text(detailsText, margin + 2, yPosition)
      yPosition += 5

      // Separator line
      doc.setDrawColor(229, 231, 235)
      doc.line(margin, yPosition + 2, pageWidth - margin, yPosition + 2)
      yPosition += 6
    })

    // Footer on all pages
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(156, 163, 175)
      doc.setFont(undefined, 'normal')
      doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 8, { align: 'center' })
    }

    doc.save(`${meeting?.title || 'Meeting'}_Minutes_${new Date().getTime()}.pdf`)
    toast.success('PDF file downloaded!')
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/meetings')}
        className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-semibold"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Meetings</span>
      </button>

      {loading ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading meeting details...</p>
        </div>
      ) : (
        <>
          {meeting && (
            <div className="bg-white rounded-lg shadow p-3">
              <h1 className="text-xl font-bold text-slate-900 mb-1">{meeting.title}</h1>
              <p className="text-slate-600 mb-2 text-sm">
                {new Date(meeting.meeting_date).toLocaleDateString()} • {meeting.location}
              </p>
              {meeting.description && (
                <p className="text-slate-600 mb-2 text-sm">{meeting.description}</p>
              )}
            </div>
          )}

          {/* Add Item Form - Compact at Top */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <h2 className="text-lg font-bold text-slate-900 mb-4">➕ Create New Action Item</h2>
            <div className="space-y-3">
              <div className="grid grid-cols-12 gap-3">
                <select
                  value={newItem.assignedTo}
                  onChange={(e) => setNewItem({ ...newItem, assignedTo: e.target.value })}
                  className="col-span-6 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">Select Responsible Person *</option>
                  {divisionalHeads.map((head) => (
                    <option key={head.id} value={head.id}>
                      {head.full_name} {head.title ? `- ${head.title}` : ''} ({head.role})
                    </option>
                  ))}
                </select>
                <select
                  value={newItem.priority}
                  onChange={(e) => setNewItem({ ...newItem, priority: e.target.value })}
                  className="col-span-2 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
                <input
                  type="date"
                  value={newItem.dueDate}
                  onChange={(e) => setNewItem({ ...newItem, dueDate: e.target.value })}
                  className="col-span-2 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <button
                  onClick={(e) => handleAddActionItem(e)}
                  type="button"
                  className="col-span-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 font-semibold text-sm flex items-center justify-center transition"
                >
                  <Plus className="w-4 h-4 mr-1" /> Create
                </button>
              </div>
              <div className="grid grid-cols-12 gap-3">
                <div className="col-span-3 relative">
                  <input
                    ref={titleInputRef}
                    type="text"
                    value={newItem.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddActionItem(e as any)}
                    placeholder="Title *"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  {titleSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full bg-white border border-slate-300 rounded-lg shadow-lg mt-1">
                      {titleSuggestions.map((suggestion, idx) => (
                        <div
                          key={idx}
                          onClick={() => selectSuggestion(suggestion)}
                          className="px-3 py-2 cursor-pointer hover:bg-blue-50 text-sm border-b border-slate-200 last:border-b-0"
                        >
                          {suggestion}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <input
                  type="text"
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddActionItem(e as any)}
                  placeholder="Description"
                  className="col-span-9 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>
          </div>

          {actionItems.length > 0 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-900">Action Items ({actionItems.length})</h2>
                <div className="flex gap-2">
                  <button
                    onClick={downloadExcel}
                    className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-semibold"
                  >
                    <Download className="w-4 h-4" />
                    Excel
                  </button>
                  <button
                    onClick={downloadPDF}
                    className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-semibold"
                  >
                    <Download className="w-4 h-4" />
                    PDF
                  </button>
                  <button
                    onClick={sendEmail}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold"
                  >
                    <Mail className="w-4 h-4" />
                    Email
                  </button>
                  <button
                    onClick={sendWhatsApp}
                    className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm font-semibold"
                  >
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp
                  </button>
                </div>
              </div>
              {actionItems.map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                    </div>
                    <div className="flex items-center space-x-3 flex-shrink-0">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold flex-shrink-0 ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                      <span className={`text-sm font-semibold flex-shrink-0 ${getPriorityColor(item.priority)}`}>
                        ● {item.priority}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteActionItem(item.id, item.title)
                        }}
                        className="flex-shrink-0 p-2 bg-red-500 text-white rounded hover:bg-red-600 ml-2"
                        title="Delete action item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-slate-600 text-sm mb-3">{item.description}</p>
                  <div className="grid grid-cols-3 gap-4 text-sm text-slate-600 pt-3 border-t border-slate-100">
                    <div>
                      <p className="font-semibold text-slate-900">{item.full_name}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Target Date</p>
                      <p className="text-xs">{new Date(item.target_date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-900">Due In</p>
                      <p className="text-xs">{Math.max(0, Math.ceil((new Date(item.target_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} days</p>
                    </div>
                  </div>

                  {item.status === 'OPEN' && (
                    <div className="flex justify-end mt-4">
                      <button
                        onClick={() => {
                          setExpandedItemId(expandedItemId === item.id ? null : item.id)
                          if (expandedItemId !== item.id) {
                            setStatusUpdateData({ comments: '', attachment: null })
                          }
                        }}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm font-semibold"
                        title="Update status"
                      >
                        Status Update
                      </button>
                    </div>
                  )}

                  {item.status === 'FOR_REVIEW' && user?.role === 'CHIEF_OF_STAFF' && (
                    <div className="flex justify-end mt-4 space-x-2">
                      <button
                        onClick={() => {
                          setExpandedItemId(expandedItemId === item.id ? null : item.id)
                          if (expandedItemId !== item.id) {
                            setStatusUpdateData({ comments: '', attachment: null })
                          }
                        }}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm font-semibold"
                        title="Review and close or send back"
                      >
                        Admin Review
                      </button>
                    </div>
                  )}

                  {/* Inline Status Update Form for OPEN items */}
                  {expandedItemId === item.id && item.status === 'OPEN' && (
                    <div className="mt-4 pt-4 border-t border-slate-200 space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Comments
                        </label>
                        <textarea
                          value={statusUpdateData.comments}
                          onChange={(e) => setStatusUpdateData({ ...statusUpdateData, comments: e.target.value })}
                          placeholder="Add comments about this action item..."
                          rows={3}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Attachment (Optional)
                        </label>
                        <input
                          type="file"
                          onChange={(e) => setStatusUpdateData({ ...statusUpdateData, attachment: e.target.files?.[0] || null })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png"
                        />
                        {statusUpdateData.attachment && (
                          <p className="text-xs text-slate-500 mt-1">Selected: {statusUpdateData.attachment.name}</p>
                        )}
                      </div>

                      <div className="flex space-x-2 justify-end">
                        <button
                          onClick={() => {
                            setExpandedItemId(null)
                            setStatusUpdateData({ comments: '', attachment: null })
                          }}
                          className="px-4 py-2 bg-slate-200 text-slate-900 rounded hover:bg-slate-300 font-semibold text-sm"
                        >
                          Cancel
                        </button>

                        <button
                          onClick={async () => {
                            try {
                              await request('PATCH', `/action-items/${item.id}`, { status: 'FOR_REVIEW' })
                              toast.success('Marked for review!')
                              setExpandedItemId(null)
                              setStatusUpdateData({ comments: '', attachment: null })
                              loadMeetingAndItems()
                            } catch (error: any) {
                              toast.error(error?.message || 'Failed to mark for review')
                            }
                          }}
                          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold text-sm"
                        >
                          Mark for Review
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Dialog for reviewing FOR_REVIEW items */}
                  {expandedItemId === item.id && item.status === 'FOR_REVIEW' && user?.role === 'CHIEF_OF_STAFF' && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-96 overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                          <h2 className="text-xl font-bold text-slate-900">Review Before Closure</h2>
                          <button
                            onClick={() => {
                              setExpandedItemId(null)
                              setStatusUpdateData({ comments: '', attachment: null })
                            }}
                            className="text-slate-400 hover:text-slate-600"
                          >
                            ✕
                          </button>
                        </div>

                        <div className="mb-6 pb-4 border-b border-slate-200">
                          <p className="text-sm font-medium text-slate-700">Item: <span className="font-semibold">{item.title}</span></p>
                        </div>

                        <div className="space-y-4 mb-6">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              Comments
                            </label>
                            <textarea
                              value={statusUpdateData.comments}
                              onChange={(e) => setStatusUpdateData({ ...statusUpdateData, comments: e.target.value })}
                              placeholder="Add comments about this action item..."
                              rows={4}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              Attachment (Optional)
                            </label>
                            <input
                              type="file"
                              onChange={(e) => setStatusUpdateData({ ...statusUpdateData, attachment: e.target.files?.[0] || null })}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png"
                            />
                            {statusUpdateData.attachment && (
                              <p className="text-xs text-slate-500 mt-1">Selected: {statusUpdateData.attachment.name}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex space-x-3 justify-end">
                          <button
                            onClick={() => {
                              setExpandedItemId(null)
                              setStatusUpdateData({ comments: '', attachment: null })
                            }}
                            className="px-4 py-2 bg-slate-200 text-slate-900 rounded hover:bg-slate-300 font-semibold text-sm"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                await request('PATCH', `/action-items/${item.id}`, { status: 'OPEN' })
                                toast.success('Sent back to responsible person!')
                                setExpandedItemId(null)
                                setStatusUpdateData({ comments: '', attachment: null })
                                loadMeetingAndItems()
                              } catch (error: any) {
                                toast.error(error?.message || 'Failed to send back')
                              }
                            }}
                            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 font-semibold text-sm"
                          >
                            Send Back
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                await request('PATCH', `/action-items/${item.id}`, { status: 'CLOSED' })
                                toast.success('Action item closed!')
                                setExpandedItemId(null)
                                setStatusUpdateData({ comments: '', attachment: null })
                                loadMeetingAndItems()
                              } catch (error: any) {
                                toast.error(error?.message || 'Failed to close')
                              }
                            }}
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-semibold text-sm"
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {actionItems.length === 0 && (
            <div className="bg-slate-50 rounded-lg border border-dashed border-slate-300 p-12 text-center">
              <p className="text-slate-600">No action items yet. Create one above!</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
