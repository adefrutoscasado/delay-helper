import { useState } from 'react'
import { TimePicker, Card, Typography, Space, Divider, DatePicker } from 'antd'
import { useSessionStorage } from './hooks'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import advancedFormat from 'dayjs/plugin/advancedFormat'
import localeData from 'dayjs/plugin/localeData'
import weekday from 'dayjs/plugin/weekday'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import weekYear from 'dayjs/plugin/weekYear'
import 'antd/dist/antd.css'
import './App.css'
const duration = require('dayjs/plugin/duration')
const { Title } = Typography

dayjs.extend(duration)
dayjs.extend(customParseFormat)
dayjs.extend(advancedFormat)
dayjs.extend(weekday)
dayjs.extend(localeData)
dayjs.extend(weekOfYear)
dayjs.extend(weekYear)
dayjs.extend(customParseFormat)


// eslint-disable-next-line arrow-body-style
const disabledDate = (current: any) => {
  // Can not select days before today and today
  return current && current < dayjs().subtract(1, 'day').endOf('day');
}

const now = dayjs()

const App = () => {
  const [desiredFinishDateValue, setDesiredFinishDateValue] = useState(() => {
    // Example: if time is 23:30, should sum 1 day
    // Example: if time is 00:30, should NOT sum 1 day
    return now.get('hour') < 8 ?
      now.add(0, 'day').hour(8).minute(0).second(0).millisecond(0).toISOString()
      :
      now.add(1, 'day').hour(8).minute(0).second(0).millisecond(0).toISOString()
  })

  const [programDurationValue, setProgramDurationValue] = useSessionStorage('program-duration', now.hour(3).minute(50).second(0).millisecond(0).toISOString())

  const programDuration = dayjs(programDurationValue)

  const timeThatMachineShouldStart = dayjs(desiredFinishDateValue)
    .subtract(programDuration.get('hour'), 'hours')
    .subtract(programDuration.get('minute'), 'minutes')
    .subtract(programDuration.get('second'), 'seconds')

  const delayDiff = dayjs(timeThatMachineShouldStart).diff(dayjs())
  const delay = dayjs(delayDiff)

  const delayInHours = delay.get('hour') - 1 // always subtract 1 hour since we cannot choose minutes of delay

  const finishTime = dayjs()
    .add(programDuration.get('hour'), 'hours')
    .add(programDuration.get('minute'), 'minutes')
    .add(programDuration.get('second'), 'seconds')
    .add(delayInHours, 'hours')

  const startTime = dayjs()
    .add(delayInHours, 'hours')

  return (
    <div className="app">
      <Space direction="vertical" size="middle" style={{ display: 'flex', padding: '24px' }}>
        <div>
          <Title level={5}>Desired finish time</Title>
          <DatePicker
            disabledDate={disabledDate}
            showTime
            // @ts-ignore
            defaultValue={dayjs(desiredFinishDateValue)}
            onChange={(_, dateString) => {
              if (dateString) {
                setDesiredFinishDateValue(dateString)
              }
            }}
          />
        </div>
        <div>
          <Title level={5}>Program duration</Title>
          <TimePicker
            // @ts-ignore
            defaultValue={dayjs(programDurationValue)}
            onChange={(_, dateString) => {
              if (dateString) {
                setProgramDurationValue(dayjs(dateString, 'HH:mm:ss').toISOString())
              }
            }}
            status={!dayjs(programDurationValue).isValid() ? "error" : undefined}
          />
        </div>
        <Divider orientation="left">Results</Divider>
        <div>
          <Title level={5}>Delay to set</Title>
          <div>
            {delayInHours} hours
          </div>
        </div>
        <div>
          <Title level={5}>Start time</Title>
          {startTime.format('DD/MM/YYYY HH:mm:ss')}
        </div>
        <div>
          <Title level={5}>Finish time</Title>
          {finishTime.format('DD/MM/YYYY HH:mm:ss')}
        </div>
      </Space>
    </div>
  )
}

export default App
