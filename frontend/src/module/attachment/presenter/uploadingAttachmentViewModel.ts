import UploadingAttachmentEntity from "../domain/uploadingAttachmentEntity";
import UploadingPregressMap from "../domain/uploadingProgressMap";

export default class UploadingAttachmentViewModel extends UploadingAttachmentEntity {
    progressMap: UploadingPregressMap;

    constructor(entity: UploadingAttachmentEntity, progressMap: UploadingPregressMap) {
        super(entity);
        this.progressMap = progressMap;
    }

    get pregress(): number {
        const progress = this.progressMap[this.state] as number | undefined;
        return progress === undefined ? Number.NaN : progress * 100;
    }

    get filename(): string {
        return this.file.name;
    }
}
