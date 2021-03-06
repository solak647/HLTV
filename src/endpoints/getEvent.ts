import { FullEvent } from '../models/FullEvent'
import { HLTVConfig } from '../config'
import { fetchPage, toArray, getMapSlug } from '../utils/mappers'
import { popSlashSource } from '../utils/parsing'

export const getEvent = (config: HLTVConfig) => async ({
  id
}: {
  id: number
}): Promise<FullEvent> => {
  const $ = await fetchPage(`${config.hltvUrl}/events/${id}/-`, config.loadPage)

  const name = $('.eventname').text()
  const dateStart =
    Number(
      $('td.eventdate span[data-unix]')
        .first()
        .attr('data-unix')
    ) || undefined
  const dateEnd =
    Number(
      $('td.eventdate span[data-unix]')
        .last()
        .attr('data-unix')
    ) || undefined
  const prizePool = $('td.prizepool').text()
  const location = {
    name: $('img.flag').attr('title'),
    code: (popSlashSource($('img.flag')) as string).split('.')[0]
  }

  const teams = toArray($('.team-box')).map(teamEl => ({
    name: teamEl.find('.logo').attr('title'),
    id: Number(popSlashSource(teamEl.find('.logo'))),
    reasonForParticipation:
      teamEl
        .find('.sub-text')
        .text()
        .trim() || undefined
  }))

  const prizeDistribution = toArray($('.placement')).map(placementEl => ({
    place: $(placementEl.children().get(1)).text(),
    prize:
      placementEl
        .find('.prizeMoney')
        .first()
        .text() || undefined,
    team:
      placementEl.find('.team').children().length !== 0
        ? {
            name: placementEl.find('.team a').text(),
            id: Number(
              placementEl
                .find('.team a')
                .attr('href')
                .split('/')[2]
            )
          }
        : undefined
  }))

  const formats = toArray($('.formats tr')).map(formatEl => ({
    type: formatEl.find('.format-header').text(),
    description: formatEl
      .find('.format-data')
      .text()
      .split('\n')
      .join(' ')
      .trim()
  }))

  const relatedEvents = toArray($('.related-event')).map(eventEl => ({
    name: eventEl.find('.event-name').text(),
    id: Number(
      eventEl
        .find('a')
        .attr('href')
        .split('/')[2]
    )
  }))

  const mapPool = toArray($('.map-pool-map-holder')).map(mapEl =>
    getMapSlug(mapEl.find('.map-pool-map-name').text())
  )

  return {
    name,
    dateStart,
    dateEnd,
    prizePool,
    teams,
    location,
    prizeDistribution,
    formats,
    relatedEvents,
    mapPool
  }
}
