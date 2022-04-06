import { Tidact } from "./Tidact"

const greet = 'hello world'

/** @jsxRuntime classic */
/** @jsx Tidact.createElement */
const element = (
  <div id="10" style={{background: 'salmon', color: 'blue'}}>
    <div id="20">
      {greet}
    </div>
  </div>
)

const container = document.getElementById('root')

if (container) {
  Tidact.render(element, container)
}
