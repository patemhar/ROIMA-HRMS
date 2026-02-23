import OrgChartComponent from '@/components/orgChart/orgChart'
import React from 'react'

const OrgChart = () => {
  return (
    <>
        <div className="p-4">OrgChart</div>
        <div className='flex justify-center items-center h-full'>
            <OrgChartComponent/>
        </div>
    </>
  )
}

export default OrgChart