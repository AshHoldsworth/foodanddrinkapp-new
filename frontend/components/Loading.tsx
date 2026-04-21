type LoadingProps = {
  label?: string
}

const Loading = ({ label }: LoadingProps) => {
  if (label) {
    return (
      <div className="flex items-center gap-2">
        <span className="loading loading-spinner loading-sm"></span>
        <span>{label}</span>
      </div>
    )
  }

  return (
    <div className="flex w-full h-full justify-center">
      <span className="loading loading-spinner loading-xl"></span>
    </div>
  )
}

export default Loading
