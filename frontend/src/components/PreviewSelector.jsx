import { edgeMethods } from "../utils/edgeMethods";

function PreviewSelector({ previews, selected, onChange }) {
  return (
    <div className="flex overflow-x-auto gap-4 mb-4">
      {edgeMethods.map((method) => (
        <div
          key={method.id}
          className="cursor-pointer flex-shrink-0"
          onClick={() => onChange(method.id)}
        >
          <img
            src={previews[method.id]}
            alt={method.name}
            className={`w-24 h-24 object-cover rounded border-2 ${
              selected === method.id ? "border-blue-500" : "border-transparent"
            }`}
          />
          <p className="text-xs text-center mt-1 whitespace-nowrap">
            {method.name}
          </p>
        </div>
      ))}
    </div>
  );
}

export default PreviewSelector;
