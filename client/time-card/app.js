$(document).ready(function(){
   populateDropDown()
   populateDates()
   createTimeCardTable()
})

function submitTime() {
  const timeCardNameValuePairs = $('form').serializeArray()
  const timeCardRaw = {}

  timeCardNameValuePairs.forEach(item => {
    timeCardRaw[item.name] = item.value
  })

  delete timeCardRaw.durationHours
  delete timeCardRaw.durationMinutes

  timeCardRaw.duration = calculateMinutes()

  // Copies timeCardRaw, then overides the values for activityId and duration in the new timeCard object
  const timeCard = {
    ...timeCardRaw,
    activityId: parseInt(timeCardRaw.activityId),
  }

  $.post({
    url: '/time-cards',
    data: JSON.stringify(timeCard),
    headers: {
      'content-type': 'application/json'
    }
  })
    .done(() => {
      createTimeCardTable()
    })
    .fail((xhr) => {
      console.log('Error sending data to server.', xhr.responseText)
    })
}

function populateDropDown() {
  const dropDownElement = $('#dropDown')

  $.get('/activities')
    .done(activities => {
      activities.sort().forEach(activity => {
        const dropDownItem = $('<option></option>').append(activity.name)
        dropDownItem.val(activity.id)
        dropDownElement.append(dropDownItem)
      })
    })
    .fail(xhr => {
      console.log('Error loading activities.', xhr.responseText)
    })
}

function createTimeCardTable() {
  $.get('/time-cards')
    .done(timeCards => {
      const filteredTimeCards = filterByDate(timeCards)

      const timeCardTableBody = $('#timeCardTable > tbody')
      timeCardTableBody.html('')

      filteredTimeCards.reverse().forEach( row => {
        const newRow = $('<tr></tr>') // Create new html row.

        for (var property in row) {
          const newCell = $('<td></td>') // Create empty html cell
          newCell.append(row[property]) // Insert cell-value into html cell
          newRow.append(newCell) // Insert html cell into html row
        }

        timeCardTableBody.append(newRow) // Insert html row into table.
      })

    })
    .fail(xhr => {
      console.log('Error loading time cards.', xhr.responseText)
    })
}

function calculateMinutes() {
  const hours = $('#durationHours').val()
  const minutes = $('#durationMinutes').val()
  const totalMinutes = (parseInt(hours) || 0) * 60 + (parseInt(minutes) || 0)

  return totalMinutes
}

function filterByDate(timeCards) {
  const startDate = $('.startDate').val()
  const endDate = $('.endDate').val()

  // Activity, Date, Duration, Description
  const filteredTimeCards = timeCards.filter(timeCard => {
    const activityDate = timeCard.activity_date
    return activityDate <= endDate && activityDate >= startDate
  })

  return filteredTimeCards
}


function populateDates() {
  const today = new Date()
  let dd = today.getDate()
  let mm = today.getMonth() + 1
  const yyyy = today.getFullYear()

  if (dd < 10) {
    dd = '0' + dd
  }

  if (mm < 10) {
    mm = '0' + mm
  }

  const firstOfThisYear = yyyy + '-' + mm + '-' + '01'
  $('.startDate').val(firstOfThisYear)

  const todayDate =  yyyy + '-' + mm + '-' + dd
  $('.endDate').val(todayDate)
  $('.timeCardDate').val(todayDate)
}
