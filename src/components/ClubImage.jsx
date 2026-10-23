const responsiveImages = {
  '/images/hakuba-course-september-2026.jpg': ['hakuba-course-september-2026', [640, 960, 1280]],
  '/images/facebook-grading-practice.jpg': ['facebook-grading-practice', [640, 960, 1280]],
  '/images/video-stills/counter-practice-wide.jpg': ['counter-practice-wide', [640, 960, 1080]],
  '/images/video-stills/group-partner-practice-wide.jpg': ['group-partner-practice-wide', [640, 960, 1080]],
  '/images/mixed-class-training.png': ['mixed-class-training', [640, 960, 1280]],
  '/images/no-gi-training.png': ['no-gi-training', [640, 960, 1280]],
  '/images/video-stills/1121619617203683-12s.jpg': ['1121619617203683-12s', [511]],
}

export default function ClubImage({ src, alt, sizes = '(min-width: 1200px) 560px, (min-width: 700px) 46vw, 92vw', ...props }) {
  const asset = responsiveImages[src]
  if (!asset) return <img src={src} alt={alt} {...props} />
  const [name, widths] = asset
  const path = (width) => `/images/optimized/${name}-${width}.webp`
  return <img src={path(widths[widths.length - 1])} srcSet={widths.map((width) => `${path(width)} ${width}w`).join(', ')} sizes={sizes} alt={alt} {...props} />
}
