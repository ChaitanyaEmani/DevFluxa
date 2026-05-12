"use client"

import { useState } from "react"
import { CopyButton } from "@/components/ui/CopyButton"
import { Download } from "@/components/ui/Download"
import { Button } from "@/components/ui/Button"
import { Header } from "@/components/ui/Header"
import { FakeUser, generateFakeUsers } from "@/lib/generators/fakeUserdata"


export function FakeUserDataGenerator() {
  const [count, setCount] = useState(5)
  const [users, setUsers] = useState<FakeUser[]>([])
  const [selectedFormat, setSelectedFormat] = useState<'json' | 'csv' | 'sql'>('json')

  const generateUsers = () => {
    const newUsers = generateFakeUsers(count)
    setUsers(newUsers)
  }

  const clearAll = () => {
    setUsers([])
  }

  const getFormattedOutput = (): string => {
    if (selectedFormat === 'json') {
      return JSON.stringify(users, null, 2)
    } else if (selectedFormat === 'csv') {
      const headers = 'ID,FirstName,LastName,Email,Phone,City,State,Country,Company,Title,Age\n'
      const rows = users.map(user => 
        `${user.id},"${user.name.firstName}","${user.name.lastName}","${user.email}","${user.phone}","${user.address.city}","${user.address.state}","${user.address.country}","${user.company.name}","${user.company.title}",${user.age}`
      ).join('\n')
      return headers + rows
    } else if (selectedFormat === 'sql') {
      return users.map(user => 
        `INSERT INTO users (id, first_name, last_name, email, phone, city, state, country, company, title, age) VALUES (${user.id}, '${user.name.firstName}', '${user.name.lastName}', '${user.email}', '${user.phone}', '${user.address.city}', '${user.address.state}', '${user.address.country}', '${user.company.name}', '${user.company.title}', ${user.age});`
      ).join('\n')
    }
    return ''
  }

  return (
    <div className="container py-8">
      <div className="max-w-6xl mx-auto">
        <Header 
          toolTitle="Fake User Data Generator" 
          toolDescription="Generate realistic fake user data for testing and development purposes." 
        />

        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <Button onClick={generateUsers} className="shadow-sm hover:shadow-md transition-all duration-200">
              <span className="mr-2">👥</span>Generate Users
            </Button>
          </div>
          
          <div className="flex items-center gap-4 ml-auto">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Count:</label>
              <input 
                type="number"
                min="1"
                max="100"
                value={count}
                onChange={(e) => setCount(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
                className="w-16 px-2 py-1 border border-border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Format:</label>
              <select 
                value={selectedFormat} 
                onChange={(e) => setSelectedFormat(e.target.value as 'json' | 'csv' | 'sql')}
                className="px-3 py-1 border border-border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="json">JSON</option>
                <option value="csv">CSV</option>
                <option value="sql">SQL</option>
              </select>
            </div>
            <Button variant="outline" onClick={clearAll} className="shadow-sm hover:shadow-md transition-all duration-200 text-destructive hover:bg-destructive/5">
              <span className="mr-2">🗑️</span>Clear
            </Button>
          </div>
        </div>

        {/* Results */}
        {users.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                Generated Users ({users.length})
              </h3>
              <div className="flex gap-2">
                <CopyButton text={getFormattedOutput()} />
                <Download 
                  content={getFormattedOutput()} 
                  filename={`fake-users.${selectedFormat}`} 
                  mimeType={selectedFormat === 'json' ? 'application/json' : 'text/plain'} 
                />
              </div>
            </div>
            
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-primary/5 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative border-2 border-border/50 rounded-lg bg-background/50 backdrop-blur-sm overflow-hidden">
                <div className="max-h-96 overflow-auto">
                  {selectedFormat === 'json' && (
                    <pre className="p-4 text-sm font-mono">
                      {getFormattedOutput()}
                    </pre>
                  )}
                  {selectedFormat === 'csv' && (
                    <pre className="p-4 text-sm font-mono whitespace-pre-wrap">
                      {getFormattedOutput()}
                    </pre>
                  )}
                  {selectedFormat === 'sql' && (
                    <pre className="p-4 text-sm font-mono">
                      {getFormattedOutput()}
                    </pre>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {users.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-xl font-semibold mb-2">No Users Generated Yet</h3>
            <p className="text-sm mb-4">Click "Generate Users" to create fake user data for testing</p>
            <Button onClick={generateUsers} className="shadow-sm hover:shadow-md transition-all duration-200">
              <span className="mr-2">👥</span>Generate First Users
            </Button>
          </div>
        )}

        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Realistic Data', desc: 'Generate lifelike user profiles with various fields.', icon: '👤' },
              { title: 'Multiple Formats', desc: 'Export as JSON, CSV, or SQL insert statements.', icon: '📄' },
              { title: 'Customizable Count', desc: 'Generate 1 to 100 fake users at once.', icon: '🔢' },
              { title: 'Complete Profiles', desc: 'Includes name, email, phone, address, company, and more.', icon: '📋' },
              { title: 'Age Generation', desc: 'Realistic age ranges and birth dates.', icon: '📅' },
              { title: 'Company Data', desc: 'Generate company names, departments, and job titles.', icon: '🏢' },
            ].map(({ title, desc, icon }) => (
              <div key={title} className="group relative p-6 border-2 border-border/50 rounded-lg bg-background/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-primary/5 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="text-3xl mb-3">{icon}</div>
                  <h3 className="font-semibold mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 p-6 bg-muted/30 rounded-lg border">
          <h3 className="text-lg font-semibold mb-3">About This Tool</h3>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div>
              <strong>Purpose:</strong> Generate realistic fake user data for testing, development, and demonstration purposes.
            </div>
            <div>
              <strong>Data Fields:</strong> Names, emails, phones, addresses, company info, usernames, passwords, and more.
            </div>
            <div>
              <strong>Privacy:</strong> All generated data is completely fictional and random. No real user information is used.
            </div>
            <div>
              <strong>Use Cases:</strong> Database seeding, API testing, UI mockups, development environments.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
