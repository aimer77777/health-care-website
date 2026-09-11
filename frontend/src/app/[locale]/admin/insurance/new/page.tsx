import InsuranceEditor from "../insurance-editor";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function NewInsurancePage(props: Props) {
  const params = await props.params;
  return (
    <InsuranceEditor locale={params.locale} />
  );
}
