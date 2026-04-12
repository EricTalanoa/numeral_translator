interface BabylonianSvgProps {
  encoded: string
}

export function BabylonianSvg({ encoded: _encoded }: BabylonianSvgProps) {
  return <svg data-testid="babylonian-svg" width="80" height="40" />
}
