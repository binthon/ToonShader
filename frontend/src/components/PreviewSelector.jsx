import { edgeMethods } from "../utils/edgeMethods";

function PreviewSelector({ previews, selected, onChange }) {
return (
  <div className="w-full flex justify-center">
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
      {edgeMethods.map((method) => (
        <div
          key={method.id}
          className="cursor-pointer flex flex-col items-center"
          onClick={() => onChange(method.id)}
        >
          <img
            src={previews[method.id]}
            alt={method.name}
            className={`w-24 h-24 object-cover rounded border-2 ${
              selected === method.id ? "border-blue-500" : "border-transparent"
            }`}
          />
          <p className="text-xs text-center mt-2">{method.name}</p>
        </div>
      ))}
    </div>
  </div>
);
}

export default PreviewSelector;
