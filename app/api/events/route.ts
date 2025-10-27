import { v2 as cloudinary } from 'cloudinary'
import connectDB from '@/lib/mongodb'
import { NextRequest, NextResponse } from 'next/server'
import Event from '@/database/event.model'

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const formData = await req.formData() // this comes from nextjs

    let event

    try {
      event = Object.fromEntries(formData.entries())
    } catch (e) {
      return NextResponse.json({
        message: 'Invalid JSON data format',
        status: 400,
      })
    }

    const file = formData.get('image') as File

    if (!file) {
      return NextResponse.json(
        {
          message: 'Image file is required',
          status: 400,
        },
        { status: 400 }
      )
    }

    let tags = JSON.parse(formData.get('tags') as string)
    let agenda = JSON.parse(formData.get('agenda') as string)

    const arrayBuffer = await file.arrayBuffer() // this is a buffer of the file which contains the binary data
    const buffer = Buffer.from(arrayBuffer) // convert to nodejs buffer; a buffer is a raw binary data representation

    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: 'image',
            folder: 'DevEvent',
          },
          (error, result) => {
            if (error) return reject(error)
            resolve(result)
          }
        )
        .end(buffer)
    }) // this function uploads the image to cloudinary and returns the upload result

    event.image = (uploadResult as { secure_url: string }).secure_url

    // if event is successfully created
    const createdEvent = await Event.create({
      ...event,
      tags: tags,
      agenda: agenda,
    })

    return NextResponse.json(
      {
        message: 'Event Created Successfully',
        event: createdEvent,
        status: 201,
      },
      { status: 201 }
    )
  } catch (e) {
    console.error(e)
    return NextResponse.json(
      {
        message: 'Event Creation Failed',
        error: e instanceof Error ? e.message : 'Unknown Error',
        status: 500,
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    await connectDB()
    const events = await Event.find().sort({ createdAt: -1 }) // fetch all events from database sorted by most recent
    return NextResponse.json(
      {
        message: 'Events Fetched Successfully',
        events,
        status: 200,
      },
      { status: 200 }
    )
  } catch (e) {
    console.error(e)
    return NextResponse.json(
      {
        message: 'Events Fetching Failed',
        error: e instanceof Error ? e.message : 'Unknown Error',
        status: 500,
      },
      { status: 500 }
    )
  }
}
