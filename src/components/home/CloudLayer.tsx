export function CloudLayer() {
  return (
    <div className="cloud-layer" aria-hidden="true">
      {/* Nubes realistas lado izquierdo */}
      <div className="realistic-cloud cloud-1">
        <div className="cloud-part cloud-part-1" />
        <div className="cloud-part cloud-part-2" />
        <div className="cloud-part cloud-part-3" />
        <div className="cloud-part cloud-part-4" />
      </div>
      <div className="realistic-cloud cloud-2">
        <div className="cloud-part cloud-part-1" />
        <div className="cloud-part cloud-part-2" />
        <div className="cloud-part cloud-part-3" />
      </div>
      <div className="realistic-cloud cloud-3">
        <div className="cloud-part cloud-part-1" />
        <div className="cloud-part cloud-part-2" />
        <div className="cloud-part cloud-part-3" />
        <div className="cloud-part cloud-part-4" />
      </div>
      
      {/* Nubes realistas lado derecho */}
      <div className="realistic-cloud cloud-4">
        <div className="cloud-part cloud-part-1" />
        <div className="cloud-part cloud-part-2" />
        <div className="cloud-part cloud-part-3" />
      </div>
      <div className="realistic-cloud cloud-5">
        <div className="cloud-part cloud-part-1" />
        <div className="cloud-part cloud-part-2" />
        <div className="cloud-part cloud-part-3" />
        <div className="cloud-part cloud-part-4" />
      </div>
      <div className="realistic-cloud cloud-6">
        <div className="cloud-part cloud-part-1" />
        <div className="cloud-part cloud-part-2" />
        <div className="cloud-part cloud-part-3" />
      </div>
      
      {/* Neblina de base */}
      <div className="mist-layer mist-left" />
      <div className="mist-layer mist-right" />
      <div className="mist-layer mist-center" />
    </div>
  );
}
