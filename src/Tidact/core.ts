type DomNode = HTMLElement | Text

type HTMLElementTagName = keyof HTMLElementTagNameMap

type TidactElementTagName =
  | HTMLElementTagName

type TextTidactElementProps = {
  nodeValue: string
}

type TextTidactElement = {
  type: 'TEXT_ELEMENT',
  props: TextTidactElementProps
}

type Primitive = string | number | boolean
type JSXPropsValueType = Primitive | Primitive[] | object | object[]

type TidactElementProps = {
  children: TidactElement[]
  [key: string]: JSXPropsValueType
}

type TidactHostElement<P = TidactElementProps, T extends TidactElementTagName = TidactElementTagName> =
  {
    type: T,
    props: P
  }

type TidactElement<P = TidactElementProps, T extends TidactElementTagName = TidactElementTagName> =
  | TidactHostElement<P, T>
  | TextTidactElement

type State = {
  nextUnitOfWork?: Fiber
}

type Fiber = {}

const state: State = {}

export const createElement =
  (
    type: HTMLElementTagName,
    props: { [key: string]: JSXPropsValueType },
    ...children: (TidactElement | string)[]
  ): TidactElement =>
    ({
      type,
      props: {
        ...props,
        children: children.map(child =>
          typeof child === 'string' ?
            createTextElement(child) :
            child,
        ),
      },
    })

const createTextElement =
  (text: string): TextTidactElement =>
    ({
      type: 'TEXT_ELEMENT',
      props: {
        nodeValue: text,
      },
    })

const isProperty = (key: string) => key !== 'children'

const performUnitOfWork =
  (fiber: Fiber) => {

    return fiber
  }

const workLoop: IdleRequestCallback =
  (deadline) => {
    let shouldYield = false

    while (state.nextUnitOfWork && !shouldYield) {
      state.nextUnitOfWork = performUnitOfWork(state.nextUnitOfWork)
      shouldYield = deadline.timeRemaining() < 1
    }

    requestIdleCallback(workLoop)
  }

requestIdleCallback(workLoop)

export const render =
  (element: TidactElement, container: DomNode): void => {
    if (element.type === 'TEXT_ELEMENT') {
      const text = document.createTextNode(element.props.nodeValue)
      container.appendChild(text)

      return
    }

    const dom = document.createElement(element.type)
    Object.keys(element.props).filter(isProperty).forEach(name => {
      const value = element.props[name]
      if (typeof value === 'string') {
        dom.setAttribute(name, value)
      } else if (name === 'style') {
        const style = Object.entries(value).map(kv => `${kv[0]}: ${kv[1]}`).join('; ')
        dom.setAttribute(name, style)
      }
    })

    const children = element.props.children
    children.forEach(child => render(child, dom))

    container.appendChild(dom)
  }

