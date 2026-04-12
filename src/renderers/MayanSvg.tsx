interface MayanSvgProps {
  encoded: string
}

export function MayanSvg({ encoded: _encoded }: MayanSvgProps) {
  return <svg data-testid="mayan-svg" width="60" height="50" />
}
