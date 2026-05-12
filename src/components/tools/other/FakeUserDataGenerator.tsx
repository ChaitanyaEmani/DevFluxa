"use client"

import { useState } from "react"
import { CopyButton } from "@/components/ui/CopyButton"
import { Download } from "@/components/ui/Download"
import { Button } from "@/components/ui/Button"
import { Header } from "@/components/ui/Header"

interface FakeUser {
  id: number
  name: {
    firstName: string
    lastName: string
    fullName: string
  }
  email: string
  phone: string
  address: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  company: {
    name: string
    department: string
    title: string
  }
  website: string
  username: string
  password: string
  avatar: string
  bio: string
  birthDate: string
  age: number
}

const firstNames = [
  'James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Charles',
  'Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen',
  'Emma', 'Olivia', 'Catherine', 'Sophie', 'Isabella', 'Mia', 'Charlotte', 'Amelia', 'Harper'
]

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Wilson', 'Anderson', 'Taylor', 'Thomas', 'Moore', 'Jackson', 'Martin', 'Lee', 'Thompson', 'White'
]

const streetNames = [
  'Main St', 'Oak Ave', 'Elm St', 'Park Blvd', 'Pine Rd', 'Maple Dr', 'Cedar Ln', 'Washington St', 'Lincoln Ave',
  'Jefferson Blvd', 'Madison Rd', 'Adams Dr', 'Jackson St', 'Van Buren Ave', 'Harrison Blvd', 'Tyler Rd'
]

const cities = [
  'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas',
  'San Jose', 'Austin', 'Jacksonville', 'Fort Worth', 'Columbus', 'Charlotte', 'San Francisco', 'Indianapolis'
]

const states = [
  'California', 'Texas', 'New York', 'Florida', 'Illinois', 'Pennsylvania', 'Ohio', 'Georgia', 'North Carolina',
  'Michigan', 'New Jersey', 'Virginia', 'Washington', 'Arizona', 'Massachusetts', 'Tennessee', 'Indiana'
]

const countries = [
  'United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 'France', 'Japan', 'China', 'India', 'Brazil'
]

const companies = [
  'TechCorp Solutions', 'Digital Innovations', 'Global Systems', 'Future Technologies', 'Smart Solutions', 'Data Analytics Pro',
  'Cloud Services Inc', 'Security Experts', 'Web Development Co', 'Mobile Apps Ltd', 'AI Systems Group'
]

const departments = [
  'Engineering', 'Marketing', 'Sales', 'Human Resources', 'Finance', 'Operations', 'Customer Support', 'Research & Development',
  'Product Management', 'Quality Assurance', 'Information Technology', 'Legal'
]

const titles = [
  'Software Engineer', 'Product Manager', 'Marketing Director', 'Sales Representative', 'Data Analyst', 'UX Designer',
  'Project Manager', 'Business Analyst', 'Quality Assurance Engineer', 'DevOps Engineer', 'Full Stack Developer'
]

function generateRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

function generateRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateRandomEmail(firstName: string, lastName: string): string {
  const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'example.com']
  const username = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${generateRandomNumber(1, 99)}`
  return `${username}@${generateRandomItem(domains)}`
}

function generateRandomPhone(): string {
  const areaCode = generateRandomNumber(200, 999)
  const exchange = generateRandomNumber(200, 999)
  const number = generateRandomNumber(1000, 9999)
  return `(${areaCode}) ${exchange}-${number}`
}

function generateRandomPassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
  let password = ''
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

function generateRandomUsername(firstName: string, lastName: string): string {
  const patterns = [
    `${firstName.toLowerCase()}${lastName.toLowerCase()}`,
    `${firstName.toLowerCase()}.${lastName.toLowerCase()}`,
    `${firstName.toLowerCase()}${generateRandomNumber(1, 99)}`,
    `${firstName.toLowerCase()}_${lastName.toLowerCase()}`,
    `${firstName.charAt(0).toLowerCase()}${lastName.toLowerCase()}`
  ]
  return generateRandomItem(patterns)
}

function generateRandomBirthDate(): { date: string; age: number } {
  const currentYear = new Date().getFullYear()
  const birthYear = currentYear - generateRandomNumber(18, 65)
  const birthMonth = generateRandomNumber(1, 12)
  const birthDay = generateRandomNumber(1, 28)
  const birthDate = new Date(birthYear, birthMonth - 1, birthDay)
  
  return {
    date: birthDate.toLocaleDateString(),
    age: currentYear - birthYear
  }
}

function generateFakeUser(id: number): FakeUser {
  const firstName = generateRandomItem(firstNames)
  const lastName = generateRandomItem(lastNames)
  const { date: birthDate, age } = generateRandomBirthDate()
  
  return {
    id,
    name: {
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`
    },
    email: generateRandomEmail(firstName, lastName),
    phone: generateRandomPhone(),
    address: {
      street: `${generateRandomNumber(100, 9999)} ${generateRandomItem(streetNames)}`,
      city: generateRandomItem(cities),
      state: generateRandomItem(states),
      zipCode: generateRandomNumber(10000, 99999).toString(),
      country: generateRandomItem(countries)
    },
    company: {
      name: generateRandomItem(companies),
      department: generateRandomItem(departments),
      title: generateRandomItem(titles)
    },
    website: `https://www.${firstName.toLowerCase()}${lastName.toLowerCase()}.com`,
    username: generateRandomUsername(firstName, lastName),
    password: generateRandomPassword(),
    avatar: `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=random`,
    bio: `Passionate ${generateRandomItem(departments).toLowerCase()} with ${generateRandomNumber(3, 10)} years of experience. Love solving complex problems and working with innovative technologies.`,
    birthDate,
    age
  }
}

function generateFakeUsers(count: number): FakeUser[] {
  const users: FakeUser[] = []
  for (let i = 1; i <= count; i++) {
    users.push(generateFakeUser(i))
  }
  return users
}

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
