"use client"

import { Button } from "@/components/ui/button"
import { Download, FileText, FileSpreadsheet } from "lucide-react"
import { toast } from "sonner"

interface Message {
  id: string
  name: string
  email: string
  company?: string
  phone?: string
  participants?: string
  subject: string
  message: string
  read: boolean
  created_at: string
}

interface ExportButtonsProps {
  messages: Message[]
}

export default function ExportButtons({ messages }: ExportButtonsProps) {
  const exportToCSV = () => {
    if (messages.length === 0) {
      toast.error("Não há mensagens para exportar")
      return
    }

    try {
      // Cabeçalhos do CSV com melhor organização
      const headers = [
        "Status",
        "Nome",
        "Email", 
        "Empresa",
        "Telefone",
        "Participantes",
        "Assunto",
        "Mensagem",
        "Data de Receção",
        "Data de Leitura"
      ]

      // Dados das mensagens organizados
      const csvData = messages.map(msg => [
        msg.read ? "Lida" : "Nao Lida",
        msg.name,
        msg.email,
        msg.company || "N/A",
        msg.phone || "N/A",
        msg.participants || "N/A",
        msg.subject,
        msg.message.replace(/"/g, '""').replace(/\n/g, ' '), // Escapar aspas e quebras de linha
        new Date(msg.created_at).toLocaleDateString("pt-BR", {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        msg.read ? new Date(msg.created_at).toLocaleDateString("pt-BR") : "Pendente"
      ])

      // Adicionar linha de estatísticas
      const statsRow = [
        "ESTATÍSTICAS",
        `Total: ${messages.length}`,
        `Lidas: ${messages.filter(m => m.read).length}`,
        `Não Lidas: ${messages.filter(m => !m.read).length}`,
        `Taxa de Leitura: ${Math.round((messages.filter(m => m.read).length / messages.length) * 100)}%`,
        "",
        "",
        "",
        `Exportado em: ${new Date().toLocaleDateString("pt-BR")}`,
        ""
      ]

      // Combinar cabeçalhos, dados e estatísticas
      const csvContent = [headers, ...csvData, [], statsRow]
        .map(row => row.map(field => `"${field}"`).join(","))
        .join("\n")

      // Criar e baixar arquivo
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", `SuperBeast_Mensagens_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast.success("CSV exportado com sucesso!")
    } catch (error) {
      console.error("Erro ao exportar CSV:", error)
      toast.error("Erro ao exportar CSV")
    }
  }

  const exportToPDF = async () => {
    if (messages.length === 0) {
      toast.error("Não há mensagens para exportar")
      return
    }

    try {
      // Importar jsPDF dinamicamente
      const { jsPDF } = await import("jspdf")
      const doc = new jsPDF()

      // Configurações do PDF
      const pageWidth = doc.internal.pageSize.width
      const pageHeight = doc.internal.pageSize.height
      let yPosition = 20
      const lineHeight = 7
      const margin = 20
      const contentWidth = pageWidth - (margin * 2)

      // Cabeçalho com logotipo e título
      doc.setFillColor(220, 38, 38) // Cor vermelha do Super Beast
      doc.rect(0, 0, pageWidth, 40, 'F')
      
      // Título principal
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(24)
      doc.setFont("helvetica", "bold")
      doc.text("SUPER BEAST", pageWidth / 2, 18, { align: "center" })
      
      // Subtítulo
      doc.setFontSize(14)
      doc.setFont("helvetica", "normal")
      doc.text("Relatório de Mensagens Recebidas", pageWidth / 2, 30, { align: "center" })
      
      // Resetar cor do texto
      doc.setTextColor(0, 0, 0)
      yPosition = 50

      // Informações da empresa
      doc.setFontSize(12)
      doc.setFont("helvetica", "normal")
      doc.text("Transformando equipas através de fitness, entretenimento e desenvolvimento pessoal", margin, yPosition, { align: "left" })
      yPosition += lineHeight
      doc.text("A experiência corporativa mais inovadora de Angola", margin, yPosition, { align: "left" })
      yPosition += lineHeight * 2

      // Data de geração
      doc.setFontSize(10)
      doc.text(`Relatório gerado em: ${new Date().toLocaleDateString("pt-BR", {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}`, margin, yPosition)
      yPosition += lineHeight * 2

      // Estatísticas em cards visuais
      const totalMessages = messages.length
      const readMessages = messages.filter(m => m.read).length
      const unreadMessages = messages.filter(m => !m.read).length
      const readRate = totalMessages > 0 ? Math.round((readMessages / totalMessages) * 100) : 0

      // Card de estatísticas
      doc.setFillColor(248, 250, 252) // bg-gray-50
      doc.rect(margin, yPosition, contentWidth, 30, 'F')
      doc.setDrawColor(209, 213, 219) // border-gray-300
      doc.rect(margin, yPosition, contentWidth, 30, 'S')
      
      // Estatísticas dentro do card
      doc.setFontSize(12)
      doc.setFont("helvetica", "bold")
      doc.text("ESTATISTICAS GERAIS", margin + 5, yPosition + 8)
      
      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      doc.text(`Total de mensagens: ${totalMessages}`, margin + 5, yPosition + 18)
      doc.text(`Mensagens lidas: ${readMessages}`, margin + 5, yPosition + 25)
      doc.text(`Mensagens não lidas: ${unreadMessages}`, margin + 5, yPosition + 32)
      doc.text(`Taxa de leitura: ${readRate}%`, margin + 5, yPosition + 39)
      
      yPosition += 50

      // Lista de mensagens organizadas
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("MENSAGENS RECEBIDAS", margin, yPosition)
      yPosition += lineHeight * 2

      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")

      messages.forEach((message, index) => {
        // Verificar se precisa de nova página
        if (yPosition > pageHeight - 40) {
          doc.addPage()
          yPosition = 20
          
          // Adicionar cabeçalho na nova página
          doc.setFillColor(220, 38, 38)
          doc.rect(0, 0, pageWidth, 20, 'F')
          doc.setTextColor(255, 255, 255)
          doc.setFontSize(12)
          doc.setFont("helvetica", "bold")
          doc.text("SUPER BEAST - Continuação", pageWidth / 2, 12, { align: "center" })
          doc.setTextColor(0, 0, 0)
          yPosition = 30
        }

        // Card da mensagem
        const messageHeight = 35
        const isUnread = !message.read
        
        // Cor de fundo baseada no status
        if (isUnread) {
          doc.setFillColor(239, 246, 255) // bg-blue-50
        } else {
          doc.setFillColor(248, 250, 252) // bg-gray-50
        }
        doc.rect(margin, yPosition, contentWidth, messageHeight, 'F')
        doc.setDrawColor(isUnread ? 147 : 209, isUnread ? 197 : 213, isUnread ? 253 : 219) // border-blue-300 ou border-gray-300
        doc.rect(margin, yPosition, contentWidth, messageHeight, 'S')

        // Conteúdo da mensagem
        doc.setFontSize(10)
        doc.setFont("helvetica", "bold")
        
        // Status da mensagem
        const statusText = isUnread ? "NOVA" : "LIDA"
        const statusColor = isUnread ? [220, 38, 38] : [34, 197, 94] // vermelho ou verde
        doc.setTextColor(statusColor[0], statusColor[1], statusColor[2])
        doc.text(statusText, margin + 5, yPosition + 8)
        
        // Nome e empresa
        doc.setTextColor(0, 0, 0)
        doc.text(`${message.name}${message.company ? ` - ${message.company}` : ''}`, margin + 5, yPosition + 18)
        
        // Email e telefone
        doc.setFontSize(8)
        doc.setFont("helvetica", "normal")
        doc.text(`Email: ${message.email}`, margin + 5, yPosition + 25)
        if (message.phone) {
          doc.text(`Telefone: ${message.phone}`, margin + 5, yPosition + 32)
        }
        
        // Assunto
        doc.setFontSize(9)
        doc.setFont("helvetica", "bold")
        doc.text(`Assunto: ${message.subject}`, margin + 5, yPosition + 40)
        
        // Data
        doc.setFontSize(8)
        doc.setFont("helvetica", "normal")
        doc.text(`Data: ${new Date(message.created_at).toLocaleDateString("pt-BR")}`, margin + 5, yPosition + 47)

        yPosition += messageHeight + 5
      })

      // Rodapé
      yPosition += lineHeight
      doc.setDrawColor(209, 213, 219)
      doc.line(margin, yPosition, pageWidth - margin, yPosition)
      yPosition += lineHeight
      
      doc.setFontSize(8)
      doc.setFont("helvetica", "normal")
      doc.text("© 2025 Super Beast - Fit Em 14 Semanas. Todos os direitos reservados.", pageWidth / 2, yPosition, { align: "center" })
      yPosition += lineHeight
      doc.text("Transformando equipas através de fitness, entretenimento e desenvolvimento pessoal", pageWidth / 2, yPosition, { align: "center" })

      // Salvar PDF
      doc.save(`SuperBeast_Mensagens_${new Date().toISOString().split('T')[0]}.pdf`)
      toast.success("PDF exportado com sucesso!")
    } catch (error) {
      console.error("Erro ao exportar PDF:", error)
      toast.error("Erro ao exportar PDF")
    }
  }

  return (
    <div className="flex gap-3">
      <Button 
        onClick={exportToCSV} 
        variant="outline" 
        size="sm"
        className="flex items-center gap-2"
      >
        <FileSpreadsheet className="w-4 h-4" />
        Exportar CSV
      </Button>
      
      <Button 
        onClick={exportToPDF} 
        variant="outline" 
        size="sm"
        className="flex items-center gap-2"
      >
        <FileText className="w-4 h-4" />
        Exportar PDF
      </Button>
    </div>
  )
}
