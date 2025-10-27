import BookEvent from '@/components/BookEvent'
import EventCard from '@/components/EventCard'
import { IEvent } from '@/database'
import { getSimilarEventsBySlug } from '@/lib/actions/event.actions'
import Image from 'next/image'
import { notFound } from 'next/navigation'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL

const EventDetailItem = ({
  icon,
  alt,
  label,
}: {
  icon: string
  alt: string
  label: string
}) => (
  <div className='flex-row-gap-2 items-center'>
    <Image src={icon} alt={alt} width={17} height={17} />
    <p>{label}</p>
  </div>
)

const EventAgenda = ({ agendaItems }: { agendaItems: string[] }) => (
  <div className='agenda'>
    <h2>Agenda</h2>
    <ul>
      {agendaItems.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  </div>
)

const EventTags = ({ tags }: { tags: string[] }) => (
  <div className='flex flex-row gap-1.5 flex-wrap'>
    {tags.map((tag) => (
      <div className='pill' key={tag}>
        {tag}
      </div>
    ))}
  </div>
)

const EventDetailsPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>
}) => {
  const { slug } = await params // this is coming from the URL

  const request = await fetch(`${BASE_URL}/api/events/${slug}`)

  // the name event comes from the API response from the route in /api/events/[slug].ts
  const {
    event: {
      description,
      image,
      overview,
      date,
      time,
      location,
      mode,
      agenda,
      audience,
      tags,
      organizer,
    },
  } = await request.json()

  if (!description) return notFound()

  const bookings = 10 // Placeholder for number of bookings

  // @ts-ignore
  const similarEvents: IEvent[] = await getSimilarEventsBySlug(slug)

  return (
    <section id='event'>
      <div className='header'>
        <h1>Event Description</h1>

        <p>{description}</p>
      </div>

      <div className='details'>
        {/* Left Side - Event Content */}
        <div className='content'>
          <Image
            src={image}
            alt='Event Banner'
            width={800}
            height={800}
            className='banner'
          />

          <section className='flex-col-gap-2'>
            <h2>Overview</h2>
            <p>{overview}</p>
          </section>

          <section className='flex-col-gap-2'>
            <h2>Event Details</h2>
            <EventDetailItem
              icon='/icons/calendar.svg'
              alt='Calendar'
              label={date}
            />
            <EventDetailItem icon='/icons/clock.svg' alt='Clock' label={time} />
            <EventDetailItem
              icon='/icons/pin.svg'
              alt='Location'
              label={location}
            />
            <EventDetailItem icon='/icons/mode.svg' alt='Mode' label={mode} />
            <EventDetailItem
              icon='/icons/audience.svg'
              alt='Audience'
              label={audience}
            />
          </section>
          <EventAgenda agendaItems={agenda} />

          <section className='flex-col-gap-2'>
            <h2>About the Organizer</h2>
            <p>{organizer}</p>
          </section>

          <EventTags tags={tags} />
        </div>

        {/* Right Side - Booking Form */}
        <aside className='booking'>
          <div className='signup-card'>
            <h2>Book Your Spot</h2>
            {bookings > 0 ? (
              <p className='text-sm'>
                Join {bookings} people who have already booked their spot!
              </p>
            ) : (
              <p className='text-sm'>Be the first to book your spot!</p>
            )}

            <BookEvent />
          </div>
        </aside>
      </div>

      <div className='flex w-full flex-col gap-4 pt-20'>
        <h2>Similar Events</h2>
        <div className='events'>
          {similarEvents.length > 0 &&
            similarEvents.map((similarEvent: IEvent) => (
              <EventCard {...similarEvent} key={similarEvent.title} />
            ))}
        </div>
      </div>
    </section>
  )
}

export default EventDetailsPage
