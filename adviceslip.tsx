'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, Search, RefreshCw } from 'lucide-react'

interface AdviceSlip {
  id: number
  advice: string
}

export default function AdviceSlipUI() {
  const [advice, setAdvice] = useState<AdviceSlip | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<AdviceSlip[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [direction, setDirection] = useState(0)

  const fetchRandomAdvice = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('https://api.adviceslip.com/advice')
      const data = await response.json()
      setAdvice({ id: data.slip.id, advice: data.slip.advice })
    } catch (error) {
      console.error('Error fetching advice:', error)
    }
    setIsLoading(false)
  }

  const searchAdvice = async () => {
    if (searchQuery.trim() === '') return
    setIsLoading(true)
    setIsSearching(true)
    try {
      const response = await fetch(`https://api.adviceslip.com/advice/search/${encodeURIComponent(searchQuery)}`)
      const data = await response.json()
      if (data.slips) {
        setSearchResults(data.slips.map((slip: any) => ({ id: slip.id, advice: slip.advice })))
        setCurrentIndex(0)
      } else {
        setSearchResults([])
      }
    } catch (error) {
      console.error('Error searching advice:', error)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchRandomAdvice()
  }, [])

  const handleSwipe = (newDirection: number) => {
    setDirection(newDirection)
    if (isSearching) {
      setCurrentIndex((prevIndex) => {
        const newIndex = prevIndex + newDirection
        return Math.max(0, Math.min(newIndex, searchResults.length - 1))
      })
    } else {
      fetchRandomAdvice()
    }
  }

  const variants = {
    enter: (direction: number) => {
      return {
        x: direction > 0 ? 300 : -300,
        opacity: 0
      }
    },
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => {
      return {
        zIndex: 0,
        x: direction < 0 ? 300 : -300,
        opacity: 0
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/90 backdrop-blur-md shadow-xl rounded-xl overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl font-bold text-center text-primary">Advice Slip</CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Discover and search for wisdom from over 10 million advice
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-2">
          <div className="flex mb-4">
            <Input
              type="text"
              placeholder="Search for advice..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-grow mr-2"
            />
            <Button onClick={searchAdvice} variant="outline">
              <Search className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative h-48 overflow-hidden bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
            {isLoading ? (
              <div className="text-primary animate-pulse">Loading advice...</div>
            ) : (
              <AnimatePresence initial={false} custom={direction}>
                <motion.div
                  key={isSearching ? searchResults[currentIndex]?.id : advice?.id}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 }
                  }}
                  className="absolute w-full h-full flex items-center justify-center text-center px-4"
                >
                  <p className="text-lg font-medium text-primary">
                    {isSearching ? searchResults[currentIndex]?.advice : advice?.advice}
                  </p>
                </motion.div>
              </AnimatePresence>
            )}
          </div>
          <div className="flex justify-between">
            <Button 
              onClick={() => handleSwipe(-1)} 
              variant="outline" 
              size="icon"
              disabled={isSearching && currentIndex === 0}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button 
              onClick={() => {setIsSearching(false); fetchRandomAdvice()}} 
              variant="outline" 
              size="icon"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button 
              onClick={() => handleSwipe(1)} 
              variant="outline" 
              size="icon"
              disabled={isSearching && currentIndex === searchResults.length - 1}
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          {isSearching && (
            <div className="mt-4 text-center text-sm text-muted-foreground">
              Showing result {currentIndex + 1} of {searchResults.length}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
