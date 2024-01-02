type Props = {};

export default function About({}: Props) {
  return (
    <div className="mx-auto w-full">
      <div className="mx-auto max-w-sm rounded-md bg-black/80 backdrop-blur p-8 md:max-w-none">
        <h2 className="mb-4 border-b-2 border-primary pb-2 text-xl uppercase">
          About Flamelings
        </h2>

        <p className="text-sm font-thin">
          {process.env.NEXT_PUBLIC_PROJECT_DESCRIPTION}
        </p>
      </div>
    </div>
  );
}
