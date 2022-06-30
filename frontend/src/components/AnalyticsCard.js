import React from 'react'

function AnalyticsCard(props) {
  return (
    <div className="analytics-card-col">
        <p><h3>{props.heading}</h3></p>
        <p><h6>{props.subHeading}</h6></p>
        <p className='money'>
          <i className="fas fa-rupee-sign"></i>{props.money}
        </p>
        <i className={`${props.logoClass} analytics-card-logo`}></i>
    </div>
  )
}

export default AnalyticsCard