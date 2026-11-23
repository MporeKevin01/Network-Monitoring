const timeFormat = new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' })
const dateFormat = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })

export const formatTime = time => time ? timeFormat.format(time) : '—'
export const formatDate = time => time ? dateFormat.format(time) : '—'
export const formatDuration = value => value == null ? '—' : `${value} ms`
