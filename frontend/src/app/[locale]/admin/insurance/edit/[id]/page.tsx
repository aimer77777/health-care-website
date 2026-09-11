"use client";

import InsuranceUsecase from "@/module/insurance/application/insuranceUsecase";
import InsuranceRepoImpl from "@/module/insurance/presenter/insuranceRepoImpl";
import InsuranceViewModel from "@/module/insurance/presenter/insuranceViewModel";
import { useRouter } from "next/navigation";
import InsuranceEditor from "../../insurance-editor";
import { useEffect, useState, use } from "react";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

const usecase = new InsuranceUsecase(new InsuranceRepoImpl());

export default function EditInsurancePage(props: Props) {
  const params = use(props.params);
  const router = useRouter();

  const [insurance, setInsurance] = useState<InsuranceViewModel | undefined>(undefined);

  async function fetchAll() {
    const idNum = parseInt(params.id);
    const entity = await usecase.getInsuranceById(idNum);
    setInsurance(new InsuranceViewModel(entity));
  }

  useEffect(() => {
    fetchAll().catch((err) => {
      console.error(err);
      router.replace(`/${params.locale}/404`);
    });
  }, []);


  return insurance === undefined
    ? (<></>)
    : (
      <InsuranceEditor
        locale={params.locale}
        updateId={insurance.id}
        defaultValues={{ ...insurance }}
      />
    );
}
