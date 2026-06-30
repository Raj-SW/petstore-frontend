"use client"

import { useState, useRef, useEffect, useMemo, useCallback } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Search } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

const getBoxShadow = (isClicked, isFocused) => {
  if (isClicked) return "0 0 40px rgba(139,92,246,0.5), 0 0 15px rgba(236,72,153,0.7) inset";
  if (isFocused) return "0 15px 35px rgba(0,0,0,0.3)";
  return "0 0 0 rgba(0,0,0,0)";
};

const getSearchIconClass = (isAnimating, isFocused) => {
  if (isAnimating) return "text-purple-400";
  if (isFocused) return "text-white";
  return "text-white/70";
};

const GooeyFilter = () => (
  <svg style={{ position: "absolute", width: 0, height: 0 }} aria-hidden="true">
    <defs>
      <filter id="gooey-effect">
        <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="blur" />
        <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -8" result="goo" />
        <feComposite in="SourceGraphic" in2="goo" operator="atop" />
      </filter>
    </defs>
  </svg>
)

const SearchBar = ({
  placeholder = "Search for products...",
  showInPages = ["/petshop", "/product"],
}) => {
  const inputRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()

  const [isFocused, setIsFocused] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isAnimating, setIsAnimating] = useState(false)
  const [isClicked, setIsClicked] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  const isUnsupportedBrowser = useMemo(() => {
    if (typeof window === "undefined") return false
    const ua = navigator.userAgent.toLowerCase()
    const isSafari = ua.includes("safari") && !ua.includes("chrome") && !ua.includes("chromium")
    const isChromeOniOS = ua.includes("crios")
    return isSafari || isChromeOniOS
  }, [])

  const sanitizeInput = (input) => input.replace(/[<>]/g, "").trim().slice(0, 100)

  const handleSearch = useCallback(() => {
    const sanitized = sanitizeInput(searchQuery)
    if (sanitized) {
      setIsAnimating(true)
      setTimeout(() => {
        navigate(`/petshop?search=${encodeURIComponent(sanitized)}`)
        setIsAnimating(false)
      }, 400)
    }
  }, [searchQuery, navigate])

  const handleSubmit = (e) => {
    e.preventDefault()
    handleSearch()
  }

  const handleMouseMove = (e) => {
    if (isFocused) {
      const rect = e.currentTarget.getBoundingClientRect()
      setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top })
    }
  }

  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top })
    setIsClicked(true)
    setTimeout(() => setIsClicked(false), 800)
  }

  useEffect(() => {
    if (isFocused && inputRef.current) inputRef.current.focus()
  }, [isFocused])

  const shouldShow = showInPages.some((path) =>
    location.pathname.toLowerCase().includes(path.toLowerCase())
  )
  if (!shouldShow) return null

  const searchIconVariants = {
    initial: { scale: 1 },
    animate: {
      rotate: isAnimating ? [0, -15, 15, -10, 10, 0] : 0,
      scale: isAnimating ? [1, 1.3, 1] : 1,
      transition: { duration: 0.6, ease: "easeInOut" },
    },
  }

  // NOSONAR — Math.random() is intentional here: decorative animation particles only, no security context
  const rand = () => Math.random(); // NOSONAR
  const particles = Array.from({ length: isFocused ? 18 : 0 }, (_, i) => (
    <motion.div
      key={i}
      initial={{ scale: 0 }}
      animate={{
        x: [0, (rand() - 0.5) * 40],
        y: [0, (rand() - 0.5) * 40],
        scale: [0, rand() * 0.8 + 0.4],
        opacity: [0, 0.8, 0],
      }}
      transition={{
        duration: rand() * 1.5 + 1.5,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "reverse",
      }}
      className="absolute w-3 h-3 rounded-full bg-gradient-to-r from-purple-400 to-pink-400"
      style={{ left: `${rand() * 100}%`, top: `${rand() * 100}%`, filter: "blur(2px)" }}
    />
  ))

  const clickParticles = isClicked
    ? Array.from({ length: 14 }, (_, i) => (
        <motion.div
          key={`click-${i}`}
          initial={{ x: mousePosition.x, y: mousePosition.y, scale: 0, opacity: 1 }}
          animate={{
            x: mousePosition.x + (rand() - 0.5) * 160,
            y: mousePosition.y + (rand() - 0.5) * 160,
            scale: rand() * 0.8 + 0.2,
            opacity: [1, 0],
          }}
          transition={{ duration: rand() * 0.8 + 0.5, ease: "easeOut" }}
          className="absolute w-3 h-3 rounded-full"
          style={{
            background: `rgba(${Math.floor(rand() * 255)}, ${Math.floor(rand() * 200) + 55}, ${Math.floor(rand() * 255)}, 0.8)`, // NOSONAR
            boxShadow: "0 0 8px rgba(255,255,255,0.8)",
          }}
        />
      ))
    : null

  const boxShadowValue = getBoxShadow(isClicked, isFocused);
  const searchIconClass = getSearchIconClass(isAnimating, isFocused);

  return (
    <div className="relative w-full max-w-lg">
      <GooeyFilter />
      <motion.form
        onSubmit={handleSubmit}
        className="relative flex items-center justify-start w-full"
        initial={{ width: "280px" }}
        animate={{ width: isFocused ? "420px" : "280px", scale: isFocused ? 1.04 : 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        onMouseMove={handleMouseMove}
      >
        <motion.div
          className={cn(
            "flex items-center w-full rounded-full border relative overflow-hidden backdrop-blur-md",
            isFocused
              ? "border-transparent shadow-xl"
              : "border-white/20 bg-white/10"
          )}
          animate={{
            boxShadow: boxShadowValue,
          }}
          onClick={handleClick}
        >
          {isFocused && (
            <motion.div
              className="absolute inset-0 -z-10"
              initial={{ opacity: 0 }}
              animate={{
                opacity: 0.2,
                background: [
                  "linear-gradient(90deg, #f6d365 0%, #fda085 100%)",
                  "linear-gradient(90deg, #a1c4fd 0%, #c2e9fb 100%)",
                  "linear-gradient(90deg, #d4fc79 0%, #96e6a1 100%)",
                  "linear-gradient(90deg, #f6d365 0%, #fda085 100%)",
                ],
              }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            />
          )}

          <div
            className="absolute inset-0 overflow-hidden rounded-full"
            style={{ filter: isUnsupportedBrowser ? "none" : "url(#gooey-effect)", zIndex: -1 }}
          >
            {particles}
          </div>

          {isClicked && (
            <>
              <motion.div
                className="absolute inset-0 rounded-full bg-purple-400/10"
                initial={{ scale: 0, opacity: 0.7 }}
                animate={{ scale: 2, opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
              <motion.div
                className="absolute inset-0 rounded-full bg-white/20"
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />
            </>
          )}

          {clickParticles}

          <motion.div className="pl-4 py-2" variants={searchIconVariants} initial="initial" animate="animate">
            <Search
              size={20}
              strokeWidth={isFocused ? 2.5 : 2}
              className={cn(
                "transition-all duration-300",
                searchIconClass
              )}
            />
          </motion.div>

          <input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            maxLength={100}
            className="w-full py-2 px-2 bg-transparent outline-none font-medium text-sm relative z-10 text-white placeholder:text-white/50 border-none"
            style={{ background: "transparent", boxShadow: "none" }}
          />

          <AnimatePresence>
            {searchQuery && (
              <motion.button
                type="submit"
                initial={{ opacity: 0, scale: 0.8, x: -20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: -20 }}
                whileHover={{ scale: 1.05, background: "#D99A2B", color: "#fff" }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-1.5 mr-2 text-xs font-semibold rounded-full shadow-lg whitespace-nowrap"
                style={{ background: "#fff", color: "#001C10" }}
              >
                {isAnimating ? "…" : "Search"}
              </motion.button>
            )}
          </AnimatePresence>

          {isFocused && (
            <motion.div
              className="absolute inset-0 rounded-full pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0, 0.1, 0.2, 0.1, 0],
                background: "radial-gradient(circle at 50% 0%, rgba(255,255,255,0.8) 0%, transparent 70%)",
              }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "loop" }}
            />
          )}
        </motion.div>
      </motion.form>
    </div>
  )
}

export default SearchBar
