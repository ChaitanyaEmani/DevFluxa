export interface FakeUser {
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

export function generateFakeUser(id: number): FakeUser {
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

export function generateFakeUsers(count: number): FakeUser[] {
  const users: FakeUser[] = []
  for (let i = 1; i <= count; i++) {
    users.push(generateFakeUser(i))
  }
  return users
}