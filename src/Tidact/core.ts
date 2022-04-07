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

type Fiber =
  & TidactElement
  & {
  // Fiberツリー
  parent?: Fiber    // 親
  child?: Fiber     // 子
  sibling?: Fiber   // 隣の兄弟ノード（兄弟ノードは単方向リンクリスト）
  dom?: DomNode
}

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

const createDom =
  (fiber: Fiber): DomNode => {
    if (fiber.type === 'TEXT_ELEMENT') {
      const text = document.createTextNode(fiber.props.nodeValue)

      return text
    }

    const dom = document.createElement(fiber.type)

    Object.keys(fiber.props).filter(isProperty).forEach(name => {
      const value = fiber.props[name]
      if (typeof value === 'string') {
        dom.setAttribute(name, value)
      } else if (name === 'style') {
        const style = Object.entries(value).map(kv => `${kv[0]}: ${kv[1]}`).join('; ')
        dom.setAttribute(name, style)
      }
    })

    return dom
  }

const performUnitOfWork =
  (fiber: Fiber): Fiber | undefined => {
    // DOMを生成する
    if (fiber.dom === undefined) {
      fiber.dom = createDom(fiber)
    }

    // 親ノードが存在するならば、親のDOMに自身のDOMをappend
    if (fiber.parent) {
      fiber.parent.dom?.appendChild(fiber.dom)
    }

    // 子Fiberを作っていく（DOMの生成は子Fiberの処理する時に生成する）
    if (fiber.type !== 'TEXT_ELEMENT') {
      const elements = fiber.props.children
      let index = 0
      let prevSibling: Fiber | undefined = undefined

      while (index < elements.length) {
        const element = elements[index]

        const newFiber: Fiber = {
          ...element,
          parent: fiber,
        }

        if (index === 0) {
          // 引数で受け取ったFiberの子供を設定する
          fiber.child = newFiber
        } else if (prevSibling) {
          prevSibling.sibling = newFiber
        }

        prevSibling = newFiber
        index++
      }
    }

    // 次の作業対象となるFiberを決定する
    // 次の作業対象が存在しなければundefinedを返してフェーズを終了する

    if (fiber.child) {
      return fiber.child
    }

    let nextFiber: Fiber | undefined = fiber
    while (nextFiber) {
      if (nextFiber.sibling) {
        return nextFiber.sibling
      }

      nextFiber = nextFiber.parent
    }

    return
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
  }

