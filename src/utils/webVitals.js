/**
 * 📊 WEB VITALS — Monitora Core Web Vitals
 */

/**
 * Callback para Web Vitals
 */
function sendToAnalytics(metric) {
  // Enviar para seu serviço de analytics
  console.group('📊 Web Vitals')
  console.log(`${metric.name}: ${metric.value.toFixed(2)}ms (${metric.rating})`)
  console.table({
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    id: metric.id,
  })
  console.groupEnd()

  // Opcional: Enviar para servidor
  if (navigator.sendBeacon) {
    try {
      navigator.sendBeacon('/api/analytics/vitals', JSON.stringify({
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      }))
    } catch (err) {
      console.error('[Vitals] Failed to send:', err)
    }
  }
}

/**
 * Registra Web Vitals (LCP, FID, CLS)
 */
export function reportWebVitals() {
  // LCP - Largest Contentful Paint
  if ('PerformanceObserver' in window) {
    try {
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries()
        const lastEntry = entries[entries.length - 1]

        sendToAnalytics({
          name: 'LCP',
          value: lastEntry.renderTime || lastEntry.loadTime,
          rating: getLCPRating(lastEntry.renderTime || lastEntry.loadTime),
          delta: 0,
          id: Math.random().toString(36),
        })
      })

      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
    } catch (e) {
      console.error('[Vitals] LCP observation failed:', e)
    }

    // CLS - Cumulative Layout Shift
    try {
      let clsValue = 0
      const clsObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
          }
        }

        sendToAnalytics({
          name: 'CLS',
          value: clsValue,
          rating: getCLSRating(clsValue),
          delta: 0,
          id: Math.random().toString(36),
        })
      })

      clsObserver.observe({ entryTypes: ['layout-shift'] })
    } catch (e) {
      console.error('[Vitals] CLS observation failed:', e)
    }

    // FID - First Input Delay (deprecated em favor de INP)
    try {
      const fidObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          sendToAnalytics({
            name: 'FID',
            value: entry.processingStart - entry.startTime,
            rating: getFIDRating(entry.processingStart - entry.startTime),
            delta: 0,
            id: entry.name,
          })
        }
      })

      fidObserver.observe({ entryTypes: ['first-input'] })
    } catch (e) {
      console.error('[Vitals] FID observation failed:', e)
    }

    // FCP - First Contentful Paint
    try {
      const fcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries()
        const fcp = entries.find(entry => entry.name === 'first-contentful-paint')

        if (fcp) {
          sendToAnalytics({
            name: 'FCP',
            value: fcp.startTime,
            rating: getFCPRating(fcp.startTime),
            delta: 0,
            id: 'fcp',
          })
        }
      })

      fcpObserver.observe({ entryTypes: ['paint'] })
    } catch (e) {
      console.error('[Vitals] FCP observation failed:', e)
    }
  }

  // Navigation Timing
  if (window.performance && window.performance.timing) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perf = performance.timing
        const pageLoadTime = perf.loadEventEnd - perf.navigationStart
        const connectTime = perf.responseEnd - perf.requestStart
        const renderTime = perf.domComplete - perf.domLoading
        const redirectTime = perf.redirectEnd - perf.redirectStart
        const domReadyTime = perf.domContentLoadedEventEnd - perf.navigationStart
        const resourceLoadTime = perf.loadEventStart - perf.domContentLoadedEventEnd

        console.group('⏱️ Navigation Timing')
        console.log({
          'Page Load': `${pageLoadTime}ms`,
          'Connect': `${connectTime}ms`,
          'Render': `${renderTime}ms`,
          'Redirect': `${redirectTime}ms`,
          'DOM Ready': `${domReadyTime}ms`,
          'Resource Load': `${resourceLoadTime}ms`,
        })
        console.groupEnd()
      }, 0)
    })
  }
}

/**
 * Rating helpers
 */
function getLCPRating(value) {
  if (value < 2500) return 'good'
  if (value < 4000) return 'needs-improvement'
  return 'poor'
}

function getFIDRating(value) {
  if (value < 100) return 'good'
  if (value < 300) return 'needs-improvement'
  return 'poor'
}

function getCLSRating(value) {
  if (value < 0.1) return 'good'
  if (value < 0.25) return 'needs-improvement'
  return 'poor'
}

function getFCPRating(value) {
  if (value < 1800) return 'good'
  if (value < 3000) return 'needs-improvement'
  return 'poor'
}

/**
 * Get performance metrics
 */
export function getPerformanceMetrics() {
  if (!window.performance) return null

  const perf = performance.timing
  const navigation = performance.navigation

  return {
    navigation: {
      type: navigation.type,
      redirectCount: navigation.redirectCount,
    },
    timing: {
      navigationStart: perf.navigationStart,
      unloadEventStart: perf.unloadEventStart,
      unloadEventEnd: perf.unloadEventEnd,
      redirectStart: perf.redirectStart,
      redirectEnd: perf.redirectEnd,
      fetchStart: perf.fetchStart,
      domainLookupStart: perf.domainLookupStart,
      domainLookupEnd: perf.domainLookupEnd,
      connectStart: perf.connectStart,
      connectEnd: perf.connectEnd,
      secureConnectionStart: perf.secureConnectionStart,
      requestStart: perf.requestStart,
      responseStart: perf.responseStart,
      responseEnd: perf.responseEnd,
      domLoading: perf.domLoading,
      domInteractive: perf.domInteractive,
      domContentLoadedEventStart: perf.domContentLoadedEventStart,
      domContentLoadedEventEnd: perf.domContentLoadedEventEnd,
      domComplete: perf.domComplete,
      loadEventStart: perf.loadEventStart,
      loadEventEnd: perf.loadEventEnd,
    },
    durations: {
      redirect: perf.redirectEnd - perf.redirectStart,
      domainLookup: perf.domainLookupEnd - perf.domainLookupStart,
      connect: perf.connectEnd - perf.connectStart,
      request: perf.responseStart - perf.requestStart,
      response: perf.responseEnd - perf.responseStart,
      dom: perf.domComplete - perf.domLoading,
      dcl: perf.domContentLoadedEventEnd - perf.domContentLoadedEventStart,
      load: perf.loadEventEnd - perf.loadEventStart,
      pageLoadTime: perf.loadEventEnd - perf.navigationStart,
    },
  }
}
