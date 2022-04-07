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
  wipRoot?: Fiber
  deletions: Fiber[]
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
