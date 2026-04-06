// src/controllers/catering.controller.js
import * as prismaModule from '../utils/prisma.js'
const prisma = prismaModule.prisma || prismaModule.default || prismaModule

export const getPackages = async (req, res) => {
  try {
    const packages = await prisma.cateringPackage.findMany({
      where: { isActive: true },
      orderBy: { pricePerHead: 'asc' }
    })
    res.json({ success: true, packages })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export const getAllPackages = async (req, res) => {
  try {
    const packages = await prisma.cateringPackage.findMany({ orderBy: { pricePerHead: 'asc' } })
    res.json({ success: true, packages })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export const createPackage = async (req, res) => {
  try {
    const pkg = await prisma.cateringPackage.create({ data: req.body })
    res.status(201).json({ success: true, package: pkg })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export const updatePackage = async (req, res) => {
  try {
    const pkg = await prisma.cateringPackage.update({ where: { id: req.params.id }, data: req.body })
    res.json({ success: true, package: pkg })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export const deletePackage = async (req, res) => {
  try {
    await prisma.cateringPackage.update({ where: { id: req.params.id }, data: { isActive: false } })
    res.json({ success: true, message: 'Package deactivated' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}
