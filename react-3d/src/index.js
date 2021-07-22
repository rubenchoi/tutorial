import React from 'react'
import Viewer from './viewer/Viewer'
import 'bootstrap/dist/css/bootstrap.min.css'

export default function React3DComponent(props) {
  return (
    <Viewer
      {...props}
    />
  )
}
