import numpy as np
import matplotlib.pyplot as plt

class Terminal(object):

    def __init__(self):
        pass

    def doc_topics_barchart(self, input_files, param):
        data_to_return = {"data":{}}

        ok_to_process = False
        #Check the MUST Prerequisite
        # Check Restrictions
        if "d-doc-topics" in input_files:
            if len(input_files["d-doc-topics"]) > 0:
                ok_to_process = True

        if not ok_to_process:
            res_err = {"data":{}}
            res_err["data"]["error"] = "Input data missing!"
            return res_err

        #For each different file entry in input_files["d-doc-topics"] build a different chart and save it
        documents = input_files["d-doc-topics"]
        documents_legend = []
        for file_name in documents:
            all_tab = documents[file_name]
            if(len(all_tab[0]) > 1):
                if(len(all_tab) > 1):
                    topic_names = all_tab[0][1:]
                    doc_names = [r[0] for r in all_tab[1:]]
                    doc_names_index = [r_index for r_index in range(0, len(doc_names)) ]
                    topics_tab = [r[1:] for r in all_tab[1:]]

                    documents_legend.append(["document","index"])
                    for index_doc in range(0,len(doc_names)):
                        documents_legend.append([doc_names[index_doc],index_doc])

                    topics_tab_normalized = []
                    for row in topics_tab:
                        normalize_row = [float(cell) for cell in row]
                        topics_tab_normalized.append(normalize_row)

                    #lets draw now
                    doctopic = np.array(topics_tab_normalized)
                    N, K = doctopic.shape
                    ind = np.arange(N)  # the x-axis locations for the novels
                    width = 0.5  # the width of the bars
                    plots = []
                    height_cumulative = np.zeros(N)

                    for k in range(K):
                        color = plt.cm.coolwarm(k/K, 1)
                        if k == 0:
                            p = plt.bar(ind, doctopic[:, k], width, color=color)
                        else:
                            p = plt.bar(ind, doctopic[:, k], width, bottom=height_cumulative, color=color)
                        height_cumulative += doctopic[:, k]
                        plots.append(p)

                    plt.ylim((0, 1))  # proportions sum to 1, so the height of the stacked bars is 1
                    plt.ylabel('Topics')
                    plt.title('Topic distribution across documents')
                    plt.xticks(ind+width/2, doc_names_index)
                    plt.yticks(np.arange(0, 1, len(doc_names_index)))
                    # see http://matplotlib.org/api/pyplot_api.html#matplotlib.pyplot.legend for details
                    # on making a legend in matplotlib
                    plt.legend([p[0] for p in plots], topic_names)
                    plt.savefig('src/.tmp/doctopic_chart.png', dpi = 300)
                    plt.close()


        data_to_return["data"]["d-chartimg"] = {'doctopic_chart.png':'src/.tmp/doctopic_chart.png'}
        data_to_return["data"]["d-chartlegend"] = {'legend': documents_legend}
        return data_to_return

    def save_file(self, input_files, param):
        data_to_return = {"data":{}}

        # NO RESTRICTIONS  Takes any input

        #Build data here
        res_docs = {}
        for a_data_value in input_files:
            res_docs[a_data_value] = {}
            for file_k in input_files[a_data_value]:
                res_docs[a_data_value][file_k] = input_files[a_data_value][file_k]

        data_to_return["data"] = res_docs
        return data_to_return
