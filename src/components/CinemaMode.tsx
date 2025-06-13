"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ArrowUp, X, ChevronLeft, ChevronRight, Play, Pause, Volume2, MessageSquare, CheckCircle, Sparkles } from "lucide-react"

interface Slide {
  id: string
  title: string
  content: string
  imageUrl?: string
  commentary: string
  voiceoverScript: string
  audioUrl?: string
  duration?: string
}

interface CinemaModeProps {
  slides: Slide[]
  isLoading: boolean
  onClose: () => void
  onFollowUp: (question: string) => void
}

const CinemaMode: React.FC<CinemaModeProps> = ({ slides, isLoading, onClose, onFollowUp }) => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [followUpQuestion, setFollowUpQuestion] = useState("")
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isAudioPlaying, setIsAudioPlaying] = useState(false)
  const [voiceoverEnabled, setVoiceoverEnabled] = useState(true)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [showContent, setShowContent] = useState(false)
  const [slideDirection, setSlideDirection] = useState<"left" | "right">("right")
  const [showFollowUpSection, setShowFollowUpSection] = useState(false)
  const [showBoxSection, setShowBoxSection] = useState(true)
  const [activeTab, setActiveTab] = useState<"info" | "chapters" | "next">("info")
  const [isVideoComplete, setIsVideoComplete] = useState(false)
  const [showCompletionAnimation, setShowCompletionAnimation] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const transitionSfxRef = useRef<HTMLAudioElement | null>(null)
  const progressRef = useRef<HTMLDivElement | null>(null)
  const [progress, setProgress] = useState(0)

  // Initialize transition sound effect
  useEffect(() => {
    transitionSfxRef.current = new Audio(
      "https://raw.githubusercontent.com/Panshief12/storyboard-ai-visions/main/447808__florianreichelt__swishes-and-swooshes.mp3",
    )
    transitionSfxRef.current.volume = 0.3

    return () => {
      if (transitionSfxRef.current) {
        transitionSfxRef.current = null
      }
    }
  }, [])

  const playTransitionSfx = () => {
    if (transitionSfxRef.current && !isMuted) {
      transitionSfxRef.current.currentTime = 0
      transitionSfxRef.current.play().catch((error) => {
        console.log("Transition SFX play error:", error)
      })
    }
  }

  useEffect(() => {
    if (slides.length > 0) {
      const hasAudio = slides.some((slide) => slide.audioUrl)
      setVoiceoverEnabled(hasAudio)
    }
  }, [slides])

  useEffect(() => {
    if (slides.length > 0 && !isLoading && voiceoverEnabled) {
      setIsPlaying(true)
      playCurrentSlideAudio()
    } else if (slides.length > 0 && !isLoading && !voiceoverEnabled) {
      setIsPlaying(true)
    }
  }, [slides, isLoading, voiceoverEnabled])

  useEffect(() => {
    if (isPlaying && !isLoading && voiceoverEnabled) {
      playCurrentSlideAudio()
    } else {
      stopAudio()
    }
  }, [currentSlide, isPlaying, voiceoverEnabled])

  useEffect(() => {
    if (slides.length > 0 && !isLoading) {
      const timer = setTimeout(() => {
        setShowContent(true)
      }, 300)
      return () => clearTimeout(timer)
    } else {
      setShowContent(false)
    }
  }, [slides, isLoading])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying && !isLoading) {
      let currentProgress = 0
      interval = setInterval(() => {
        if (currentProgress < 100) {
          currentProgress += 0.1
          setProgress(currentProgress)
        } else {
          clearInterval(interval)
          if (currentSlide < slides.length - 1) {
            advanceSlideWithAnimation(currentSlide + 1)
          } else {
            setIsPlaying(false)
            setIsVideoComplete(true)
            // Start completion animation after a brief delay
            setTimeout(() => {
              setShowCompletionAnimation(true)
            }, 1000)
          }
        }
      }, 50)
    }
    return () => clearInterval(interval)
  }, [isPlaying, currentSlide, isLoading, slides.length])

  // Helper function to advance slide with animation
  const advanceSlideWithAnimation = (nextSlideIndex: number) => {
    playTransitionSfx()
    setSlideDirection("right")
    setIsTransitioning(true)
    setProgress(0)
    setTimeout(() => {
      setCurrentSlide(nextSlideIndex)
      setIsTransitioning(false)
    }, 250)
  }

  const playCurrentSlideAudio = () => {
    if (isMuted || !slides[currentSlide]?.audioUrl || !voiceoverEnabled) return

    stopAudio()

    const audio = new Audio(slides[currentSlide].audioUrl)
    audioRef.current = audio

    audio.onloadeddata = () => {
      console.log("Audio loaded for slide:", currentSlide)
    }

    audio.onplay = () => {
      setIsAudioPlaying(true)
      console.log("Audio started playing for slide:", currentSlide)
    }

    audio.onended = () => {
      setIsAudioPlaying(false)
      console.log("Audio ended for slide:", currentSlide)

      if (isPlaying && currentSlide < slides.length - 1) {
        setTimeout(() => {
          advanceSlideWithAnimation(currentSlide + 1)
        }, 500)
      } else if (currentSlide >= slides.length - 1) {
        setIsPlaying(false)
      }
    }

    audio.onerror = (e) => {
      console.error("Audio error:", e)
      setIsAudioPlaying(false)
    }

    audio.play().catch((error) => {
      console.error("Error playing audio:", error)
      setIsAudioPlaying(false)
    })
  }

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      audioRef.current = null
    }
    setIsAudioPlaying(false)
  }

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      playTransitionSfx()
      advanceSlideWithAnimation(currentSlide + 1)
    } else {
      setIsPlaying(false)
    }
  }

  const prevSlide = () => {
    if (currentSlide > 0) {
      playTransitionSfx()
      setSlideDirection("left")
      setIsTransitioning(true)
      setProgress(0)
      setTimeout(() => {
        setCurrentSlide(currentSlide - 1)
        setIsTransitioning(false)
      }, 250)
    }
  }

  // Updated toggle play function to handle image click
  const togglePlay = () => {
    if (isVideoComplete) return // Don't allow play when video is complete
    setIsPlaying(!isPlaying)
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
    if (!isMuted) {
      stopAudio()
    } else if (isPlaying && voiceoverEnabled) {
      playCurrentSlideAudio()
    }
  }

  // Enhanced close function with closing animation
  const handleClose = () => {
    setIsClosing(true)
    stopAudio()
    setTimeout(() => {
      onClose()
    }, 500) // Wait for animation to complete
  }

  // Enhanced completion animation close with closing transition
  const handleCompletionClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      setShowCompletionAnimation(false)
      setIsVideoComplete(false)
      setIsClosing(false)
    }, 300)
  }

  // Updated follow-up handler with box section hiding
  const handleFollowUp = () => {
    if (followUpQuestion.trim()) {
      stopAudio()
      setShowBoxSection(false) // Hide box section
      setIsVideoComplete(false) // Reset completion state
      setShowCompletionAnimation(false) // Reset animation state
      onFollowUp(followUpQuestion)
      setFollowUpQuestion("")
      setShowFollowUpSection(false)
    }
  }

  // Updated to show box section when new content is generated
  useEffect(() => {
    if (!isLoading && slides.length > 0) {
      const timer = setTimeout(() => {
        setShowBoxSection(true)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [slides.length, isLoading])

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleFollowUp()
    }
  }

  // Handle follow-up section toggle with box section hiding
  const handleFollowUpToggle = () => {
    const newShowState = !showFollowUpSection
    setShowFollowUpSection(newShowState)
    if (newShowState) {
      setShowBoxSection(false)
    }
  }

  // Handle follow-up section close
  const handleFollowUpClose = () => {
    setShowFollowUpSection(false)
    setShowBoxSection(true)
  }

  useEffect(() => {
    return () => {
      stopAudio()
    }
  }, [])

  return (
    <div className={`fixed inset-0 bg-black/95 z-50 flex flex-col items-center justify-center font-sans overflow-hidden transition-all duration-500 ${
      isClosing ? "animate-[slide-out-bottom_0.5s_ease-in] opacity-0" : ""
    }`}>
      {/* Blurred background image for ambiance */}
      {slides.length > 0 && slides[currentSlide]?.imageUrl && (
        <div
          className="absolute inset-0 opacity-20 bg-cover bg-center blur-2xl"
          style={{ backgroundImage: `url(${slides[currentSlide].imageUrl})` }}
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 z-10" />

      <button
        onClick={handleClose}
        className="absolute top-6 left-6 z-50 w-10 h-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center border border-white/10 hover:bg-black/50 transition-all duration-200"
      >
        <X className="w-5 h-5 text-white/80" />
      </button>

      {/* Completion Animation Overlay */}
      {showCompletionAnimation && (
        <div className={`absolute inset-0 z-40 flex items-center justify-center transition-all duration-300 ${
          isClosing ? "animate-[slide-out-bottom_0.3s_ease-in] opacity-0" : ""
        }`}>
          {/* Animated background particles */}
          <div className="absolute inset-0">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-white/30 rounded-full animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 2}s`
                }}
              />
            ))}
          </div>

          {/* Main completion card with pull-up animation */}
          <div className="relative transform animate-[slide-in-bottom_1s_ease-out] bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 text-center max-w-md mx-4">
            {/* Success icon with scale animation */}
            <div className="mb-6 animate-[scale-in_0.8s_ease-out_0.3s_both]">
              <div className="w-20 h-20 mx-auto bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-white animate-[scale-in_0.6s_ease-out_0.5s_both]" />
              </div>
            </div>

            {/* Animated text content */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white/90 animate-[fade-in_0.8s_ease-out_0.6s_both]">
                Story Complete!
              </h2>
              <p className="text-white/70 animate-[fade-in_0.8s_ease-out_0.8s_both]">
                Your visual journey has ended. Ready for more exploration?
              </p>
            </div>

            {/* Action buttons with staggered animation */}
            <div className="flex space-x-3 mt-8">
              <button
                onClick={() => {
                  setIsVideoComplete(false)
                  setShowCompletionAnimation(false)
                  setCurrentSlide(0)
                  setProgress(0)
                  setIsPlaying(true)
                }}
                className="flex-1 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl transition-all duration-300 animate-[fade-in_0.8s_ease-out_1s_both] hover:scale-105"
              >
                <Play className="w-4 h-4 inline mr-2" />
                Watch Again
              </button>
              <button
                onClick={handleFollowUpToggle}
                className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-4 py-2 rounded-xl transition-all duration-300 animate-[fade-in_0.8s_ease-out_1.2s_both] hover:scale-105"
              >
                <Sparkles className="w-4 h-4 inline mr-2" />
                Explore More
              </button>
            </div>

            {/* Close button for completion animation */}
            <button
              onClick={handleCompletionClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center border border-white/10 hover:bg-black/40 transition-all duration-200"
            >
              <X className="w-4 h-4 text-white/80" />
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="relative z-20 flex items-center justify-center">
          <div className="bg-black/40 backdrop-blur-xl p-8 rounded-3xl border border-white/10 text-center space-y-6">
            <div className="w-16 h-16 border-4 border-white/20 border-t-white/80 rounded-full animate-spin mx-auto" />
            <div>
              <p className="text-white/90 text-2xl font-medium">Creating your visual story</p>
              <p className="text-white/60 text-base mt-2">Generating images and audio narration</p>
            </div>
          </div>
        </div>
      ) : slides.length > 0 ? (
        <>
          <div
            className={`relative z-20 max-w-4xl w-full flex flex-col items-center justify-center px-3 py-4 transition-all duration-500 ${
              showContent ? "opacity-100" : "opacity-0"
            } ${showCompletionAnimation ? "transform scale-75 translate-y-8 opacity-30" : ""} ${
              isClosing ? "animate-[slide-out-bottom_0.4s_ease-in] opacity-0" : ""
            }`}
          >
            {/* Updated main image display with click handler and completion state */}
            <div
              className={`relative w-full max-w-3xl aspect-video mb-3 transition-all duration-500 cursor-pointer ${
                isTransitioning
                  ? slideDirection === "right"
                    ? "translate-x-[-5%] opacity-0"
                    : "translate-x-[5%] opacity-0"
                  : "translate-x-0 opacity-100"
              } ${isVideoComplete ? "brightness-50 scale-95" : ""}`}
              onClick={togglePlay}
            >
              {slides[currentSlide]?.imageUrl && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-white/0 rounded-3xl blur-xl transform scale-105 -z-10"></div>

                  <img
                    src={slides[currentSlide].imageUrl || "/placeholder.svg"}
                    alt={slides[currentSlide].title}
                    className={`w-full h-full object-cover rounded-3xl shadow-2xl transition-all duration-300 ${
                      !isPlaying ? "brightness-75 scale-95" : "brightness-100 scale-100"
                    }`}
                  />

                  {/* Updated play/pause overlay with better animation */}
                  <div
                    className={`absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm rounded-3xl transition-all duration-300 ${
                      isPlaying ? "opacity-0 pointer-events-none scale-90" : "opacity-100 scale-100"
                    }`}
                  >
                    <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 transition-all duration-300 hover:scale-110 hover:bg-white/30">
                      <Play className="w-10 h-10 text-white fill-white ml-1" />
                    </div>
                  </div>

                  {/* Pause indicator when playing */}
                  <div
                    className={`absolute inset-0 flex items-center justify-center transition-all duration-300 pointer-events-none ${
                      !isPlaying && showContent ? "opacity-0 scale-75" : "opacity-0 scale-75"
                    }`}
                  >
                    <div className="w-16 h-16 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20">
                      <Pause className="w-8 h-8 text-white fill-white" />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Updated info panel with transition animations */}
            <div className={`relative w-full max-w-xl transition-all duration-500 transform ${
              showBoxSection ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-95"
            }`}>
              <div className="bg-white/10 backdrop-blur-xl rounded-lg border border-white/10 overflow-hidden">
                <div className="flex items-center p-2">
                  <div className="w-16 h-12 rounded-md overflow-hidden flex-shrink-0 mr-2">
                    <img
                      src={slides[currentSlide]?.imageUrl || "/placeholder.svg"}
                      alt="Thumbnail"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1">
                    <h2 className="text-white/90 text-sm font-medium">{slides[currentSlide]?.title}</h2>
                    <p className="text-white/70 text-xs mt-0.5 line-clamp-1">{slides[currentSlide]?.voiceoverScript}</p>
                    <div className="flex items-center mt-0.5 text-white/60 text-[10px]">
                      <span>Visual Explainer</span>
                      <span className="mx-1">•</span>
                      <span>{slides[currentSlide]?.duration || "1 min"}</span>
                      {isAudioPlaying && (
                        <>
                          <span className="mx-1">•</span>
                          <Volume2 className="w-2 h-2 text-white/80" />
                        </>
                      )}
                    </div>
                  </div>

                  {/* Updated controls without play button */}
                  <div className="flex items-center space-x-1.5 ml-2">
                    <button
                      onClick={handleFollowUpToggle}
                      className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200 flex items-center justify-center"
                    >
                      <MessageSquare className="w-3 h-3 text-white/80" />
                    </button>
                  </div>
                </div>

                {/* Tabs */}
                <div className="px-2 pt-0.5">
                  <div className="flex space-x-1 justify-center">
                    <button
                      onClick={() => setActiveTab("info")}
                      className={`px-2 py-1 rounded-full text-[10px] font-medium transition-colors duration-200 ${
                        activeTab === "info" ? "bg-white/20 text-white/90" : "text-white/60 hover:text-white/80"
                      }`}
                    >
                      Info
                    </button>
                    <button
                      onClick={() => setActiveTab("chapters")}
                      className={`px-2 py-1 rounded-full text-[10px] font-medium transition-colors duration-200 ${
                        activeTab === "chapters" ? "bg-white/20 text-white/90" : "text-white/60 hover:text-white/80"
                      }`}
                    >
                      Chapters
                    </button>
                    <button
                      onClick={() => setActiveTab("next")}
                      className={`px-2 py-1 rounded-full text-[10px] font-medium transition-colors duration-200 ${
                        activeTab === "next" ? "bg-white/20 text-white/90" : "text-white/60 hover:text-white/80"
                      }`}
                    >
                      Up Next
                    </button>
                  </div>
                </div>

                {/* Tab content */}
                <div className="p-2">
                  {activeTab === "info" && (
                    <div className="text-white/80 text-[10px]">{slides[currentSlide]?.content}</div>
                  )}

                  {activeTab === "chapters" && (
                    <div className="space-y-1 max-h-24 overflow-y-auto">
                      {slides.map((slide, index) => (
                        <button
                          key={slide.id}
                          onClick={() => {
                            setCurrentSlide(index)
                            setProgress(0)
                          }}
                          className={`w-full text-left p-1 rounded-md flex items-center ${
                            currentSlide === index ? "bg-white/20" : "hover:bg-white/10"
                          }`}
                        >
                          <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center mr-1.5">
                            <span className="text-[10px] text-white/90">{index + 1}</span>
                          </div>
                          <span className={`text-[10px] ${currentSlide === index ? "text-white/90" : "text-white/70"}`}>
                            {slide.title}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {activeTab === "next" && (
                    <div className="space-y-1 max-h-24 overflow-y-auto">
                      {slides.slice(currentSlide + 1, currentSlide + 4).map((slide, index) => (
                        <button
                          key={slide.id}
                          onClick={() => {
                            setCurrentSlide(currentSlide + index + 1)
                            setProgress(0)
                          }}
                          className="w-full text-left hover:bg-white/10 rounded-md p-1 flex items-center"
                        >
                          <div className="w-8 h-8 rounded-sm overflow-hidden mr-1.5 flex-shrink-0">
                            <img
                              src={slide.imageUrl || "/placeholder.svg"}
                              alt={slide.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="text-[10px] text-white/90">{slide.title}</p>
                            <p className="text-[8px] text-white/60 mt-0.5">Coming up next</p>
                          </div>
                        </button>
                      ))}

                      {currentSlide >= slides.length - 1 && (
                        <div className="text-center text-white/60 py-1 text-[10px]">End of presentation</div>
                      )}
                    </div>
                  )}
                </div>

                {/* Progress bar */}
                <div className="px-2 pb-2">
                  <div className="h-0.5 bg-white/10 rounded-full overflow-hidden" ref={progressRef}>
                    <div
                      className="h-full bg-white/80 transition-all duration-300 ease-linear"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-0.5 text-[8px] text-white/60">
                    <span>{Math.floor((progress / 100) * 60)}s</span>
                    <span>1:00</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation arrows */}
            <div className="absolute inset-x-0 top-1/2 transform -translate-y-1/2 flex justify-between px-2 z-30 pointer-events-none">
              <button
                onClick={prevSlide}
                disabled={currentSlide === 0}
                className={`w-8 h-8 rounded-full bg-black/30 backdrop-blur-md border border-white/10 flex items-center justify-center pointer-events-auto transition-all duration-200 ${
                  currentSlide === 0 ? "opacity-50 cursor-not-allowed" : "hover:bg-black/50"
                }`}
              >
                <ChevronLeft className="w-4 h-4 text-white/80" />
              </button>

              <button
                onClick={nextSlide}
                disabled={currentSlide >= slides.length - 1}
                className={`w-8 h-8 rounded-full bg-black/30 backdrop-blur-md border border-white/10 flex items-center justify-center pointer-events-auto transition-all duration-200 ${
                  currentSlide >= slides.length - 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-black/50"
                }`}
              >
                <ChevronRight className="w-4 h-4 text-white/80" />
              </button>
            </div>
          </div>

          {/* Updated follow-up section with better transitions */}
          {showFollowUpSection && (
            <div className="fixed bottom-0 inset-x-0 p-2 z-30 animate-fade-in">
              <div className="max-w-xl mx-auto bg-white/10 backdrop-blur-xl rounded-lg border border-white/10 overflow-hidden transform transition-all duration-300 scale-100">
                <div className="p-2">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-white/90 text-[10px] font-medium">Ask a follow-up question</h3>
                    <button 
                      onClick={handleFollowUpClose} 
                      className="text-white/60 hover:text-white/90 transition-colors duration-200"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>

                  <div className="flex space-x-1.5">
                    <Textarea
                      value={followUpQuestion}
                      onChange={(e) => setFollowUpQuestion(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="What would you like to know more about?"
                      className="flex-1 bg-white/5 border-white/10 text-white/90 placeholder-white/40 resize-none focus:ring-1 focus:ring-white/20 focus:border-white/20 text-[10px] rounded-md transition-all duration-200"
                      rows={1}
                    />

                    <Button
                      onClick={handleFollowUp}
                      disabled={!followUpQuestion.trim()}
                      className="bg-white/20 hover:bg-white/30 text-white border-0 self-end transition-all duration-200 rounded-md px-2 py-1 h-6 hover:scale-105"
                    >
                      <ArrowUp className="w-2.5 h-2.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="relative z-20 text-white/80 text-xl">No slides available</div>
      )}
    </div>
  )
}

export default CinemaMode
