import {errorHandler} from '../helpers/dbErrorHandler'

const Song = require('../models/song')
const formidable = require('formidable')
const _ = require('lodash')
const fs = require('fs')

exports.songById = (req, res, next, id) => {
    Song.findById(id).exec((err, song) => {
        if (err || !song) {
            return res.status(400).json({
                error: 'Song does not exist'
            })
        }
        req.song = song
        next()
    })
}

exports.create = (req, res) => {
    const song = new Song(req.body)
    song.save((err, data) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            })
        }

        res.json({data})
    })
}

exports.read = (req, res) => {
    return res.json(req.song)
}

exports.update = (req, res) => {
    const song = req.song
    song.name = req.body.name
    song.save((err, data) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler((err))
            })
        }

        res.json(data)
    })
}

exports.remove = (req, res) => {
    const song = req.song
    song.remove((err, data) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler((err))
            })
        }

        res.json({
            message: 'Song successfully deleted'
        })
    })
}

exports.list = (req, res) => {
    Song.find().exec((err, data) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler((err))
            })
        }

        res.json(data)
    })
}

