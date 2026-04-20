'use client'

import { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react'

interface ModalContextType {
  isModalOpen: boolean
  openModal: () => void
  closeModal: () => void
}

const ModalContext = createContext<ModalContextType | undefined>(undefined)

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const scrollYRef = useRef(0)

  const openModal = () => setIsModalOpen(true)
  const closeModal = () => setIsModalOpen(false)

  useEffect(() => {
    const { body, documentElement } = document

    if (isModalOpen) {
      scrollYRef.current = window.scrollY

      body.classList.add('overflow-hidden', 'modal-open')
      documentElement.classList.add('modal-open')
      body.style.position = 'fixed'
      body.style.top = `-${scrollYRef.current}px`
      body.style.left = '0'
      body.style.right = '0'
      body.style.width = '100%'
    } else {
      body.classList.remove('overflow-hidden', 'modal-open')
      documentElement.classList.remove('modal-open')
      body.style.position = ''
      body.style.top = ''
      body.style.left = ''
      body.style.right = ''
      body.style.width = ''

      if (scrollYRef.current > 0) {
        window.scrollTo(0, scrollYRef.current)
      }
    }

    return () => {
      body.classList.remove('overflow-hidden', 'modal-open')
      documentElement.classList.remove('modal-open')
      body.style.position = ''
      body.style.top = ''
      body.style.left = ''
      body.style.right = ''
      body.style.width = ''
    }
  }, [isModalOpen])

  return (
    <ModalContext.Provider value={{ isModalOpen, openModal, closeModal }}>
      {children}
    </ModalContext.Provider>
  )
}

export const useModal = () => {
  const context = useContext(ModalContext)
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider')
  }
  return context
}
