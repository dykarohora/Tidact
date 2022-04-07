const state: State = {
  deletions: [],
}


const isProperty = (key: string) => key !== 'children'

const createDom =
  (fiber: Fiber): DomNode => {
    if (fiber.type === 'TEXT_ELEMENT') {
      return document.createTextNode(fiber.props.nodeValue)
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

// Renderフェーズ

const performUnitOfWork =
  (fiber: Fiber): Fiber | undefined => {
    // DOMを生成する
    if (fiber.dom === undefined) {
      fiber.dom = createDom(fiber)
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

    // 子Fiberが存在すれば、それを次の作業対象にする
    if (fiber.child) {
      return fiber.child
    }

    let nextFiber: Fiber | undefined = fiber
    while (nextFiber) {
      // 兄弟ファイバーが存在すれば、それを次の作業対象にする
      if (nextFiber.sibling) {
        return nextFiber.sibling
      }

      // 兄弟Fiberが存在しない場合は親の兄弟が作業対象にできないか調べる
      nextFiber = nextFiber.parent
    }

    // 次の作業対象が存在しなければundefinedを返してフェーズを終了する
    return
  }

// Commitフェーズ

const commitRoot = () => {
  commitWork(state.wipRoot?.child)
  state.wipRoot = undefined
}

const commitWork = (fiber?: Fiber) => {
  if (!fiber) {
    return
  }

  const domParent = fiber.parent?.dom

  // Renderフェーズで生成しておいたDOMをappendすることによって画面への描画を行う
  if (domParent && fiber.dom) {
    domParent.appendChild(fiber.dom)
  }

  commitWork(fiber.child)
  commitWork(fiber.sibling)
}

// レンダリングループ

const workLoop: IdleRequestCallback =
  (deadline) => {
    let shouldYield = false

    while (state.nextUnitOfWork && !shouldYield) {
      state.nextUnitOfWork = performUnitOfWork(state.nextUnitOfWork)
      shouldYield = deadline.timeRemaining() < 1
    }

    if (state.nextUnitOfWork === undefined && state.wipRoot) {
      commitRoot()
    }

    requestIdleCallback(workLoop)
  }

requestIdleCallback(workLoop)

export const render =
  (element: TidactElement, container: HTMLElement): void => {
    state.wipRoot = {
      type: container.tagName as HTMLElementTagName,
      dom: container,
      props: {
        children: [element],
      },
    }

    state.nextUnitOfWork = state.wipRoot
  }

