"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Mail, Phone, Trash2, Pencil, Search } from "lucide-react"
import { useState } from "react"
import { ClientModal } from "./client-modal"
import { useToast } from "@/hooks/use-toast"

const INITIAL_CLIENTS = [
  {
    id: 1,
    name: "Empresa XYZ Ltda.",
    email: "contato@xyz.com",
    phone: "(11) 99999-0000",
    cnpj: "12.345.678/0001-90",
    address: "Rua Principal, 123, São Paulo - SP",
    casesCount: 5,
  },
  {
    id: 2,
    name: "Consultoria ABC S.A.",
    email: "suporte@abc.com",
    phone: "(11) 98888-8888",
    cnpj: "98.765.432/0001-10",
    address: "Avenida Paulista, 1000, São Paulo - SP",
    casesCount: 3,
  },
  {
    id: 3,
    name: "Logística DEF Ltda.",
    email: "legal@def.com",
    phone: "(21) 97777-7777",
    cnpj: "55.444.333/0001-22",
    address: "Rua Comercial, 456, Rio de Janeiro - RJ",
    casesCount: 2,
  },
]

export function ClientsContent() {
  const { toast } = useToast()
  const [clients, setClients] = useState(INITIAL_CLIENTS)
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<any>(null)

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.cnpj.includes(searchTerm)
  )

  const handleSaveClient = (clientData: any) => {
    if (selectedClient) {
      setClients(clients.map((c) => (c.id === selectedClient.id ? clientData : c)))
    } else {
      setClients([...clients, clientData])
    }
    setSelectedClient(null)
  }

  const handleDeleteClient = (clientId: number) => {
    setClients(clients.filter((c) => c.id !== clientId))
    toast({
      title: "Cliente removido",
      description: "O cliente foi deletado com sucesso",
    })
  }

  const handleEditClient = (client: any) => {
    setSelectedClient(client)
    setIsModalOpen(true)
  }

  const handleNewClient = () => {
    setSelectedClient(null)
    setIsModalOpen(true)
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase()
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar cliente por nome, email ou CNPJ..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button
          onClick={handleNewClient}
          className="w-full sm:w-auto h-9 text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 hover:shadow-lg hover:shadow-primary/30 hover:scale-105"
        >
          + Novo Cliente
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((client, index) => (
          <Card
            key={client.id}
            className="p-6 hover:shadow-lg transition-all duration-300 animate-slide-in-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start justify-between mb-4">
              <Avatar className="w-12 h-12 border-2 border-primary/20">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {getInitials(client.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditClient(client)}
                  className="h-8 w-8 p-0"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteClient(client.id)}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-lg line-clamp-1">{client.name}</h3>
                <p className="text-xs text-muted-foreground">{client.cnpj}</p>
              </div>

              <div className="space-y-1 text-sm">
                <p className="text-muted-foreground line-clamp-1">
                  <span className="text-foreground">Email:</span> {client.email}
                </p>
                <p className="text-muted-foreground line-clamp-1">
                  <span className="text-foreground">Telefone:</span> {client.phone}
                </p>
              </div>

              <Badge variant="secondary">
                {client.casesCount} {client.casesCount === 1 ? "caso" : "casos"}
              </Badge>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 bg-transparent"
                  onClick={() => (window.location.href = `mailto:${client.email}`)}
                >
                  <Mail className="w-4 h-4 mr-1" />
                  Email
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 bg-transparent"
                  onClick={() => (window.location.href = `tel:${client.phone}`)}
                >
                  <Phone className="w-4 h-4 mr-1" />
                  Ligar
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredClients.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhum cliente encontrado</p>
          {searchTerm && (
            <Button
              variant="link"
              onClick={() => setSearchTerm("")}
              className="text-primary mt-2"
            >
              Limpar busca
            </Button>
          )}
        </div>
      )}

      <ClientModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedClient(null)
        }}
        onSave={handleSaveClient}
        clientData={selectedClient}
        isEditing={!!selectedClient}
      />
    </div>
  )
}
